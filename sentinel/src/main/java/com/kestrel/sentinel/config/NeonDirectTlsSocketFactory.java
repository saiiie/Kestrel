package com.kestrel.sentinel.config;

import javax.net.SocketFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.security.cert.X509Certificate;

/**
 * A custom SocketFactory that wraps connections in SSL/TLS immediately upon creation.
 * <p>
 * This is needed because the network/proxy between this machine and Neon PostgreSQL
 * does not forward the traditional PostgreSQL SSLRequest protocol message, causing
 * the JDBC driver to time out waiting for the 'S' response byte. By pre-wrapping
 * the socket in SSL and using sslmode=disable in the JDBC URL, the driver sends
 * the PostgreSQL startup message directly over the already-encrypted channel.
 */
public class NeonDirectTlsSocketFactory extends SocketFactory {

    private static SSLSocketFactory sslFactory;

    static {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
            };
            SSLContext ctx = SSLContext.getInstance("TLS");
            ctx.init(null, trustAll, new java.security.SecureRandom());
            sslFactory = ctx.getSocketFactory();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create SSL context", e);
        }
    }

    /**
     * Called by the JDBC driver to create an unconnected socket.
     * We return a plain socket that will be connected and then wrapped in SSL.
     */
    @Override
    public Socket createSocket() throws IOException {
        // Return a proxy that wraps itself in SSL when connect() is called
        return new DirectTlsProxySocket();
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException, UnknownHostException {
        return sslFactory.createSocket(host, port);
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localHost, int localPort)
            throws IOException, UnknownHostException {
        return sslFactory.createSocket(host, port, localHost, localPort);
    }

    @Override
    public Socket createSocket(InetAddress host, int port) throws IOException {
        return sslFactory.createSocket(host, port);
    }

    @Override
    public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
            throws IOException {
        return sslFactory.createSocket(address, port, localAddress, localPort);
    }

    /**
     * A proxy socket that wraps itself in SSL when connect() is called.
     * After wrapping, all I/O streams are redirected to the SSL socket.
     * This avoids the infinite recursion problem of having the SSL socket
     * delegate back to the wrapper.
     */
    private static class DirectTlsProxySocket extends Socket {
        private SSLSocket wrapped;

        @Override
        public void connect(java.net.SocketAddress endpoint, int timeout) throws IOException {
            // Connect the raw TCP socket first
            super.connect(endpoint, timeout);

            // Now wrap it in SSL, creating the SSL socket on top of the raw socket
            InetSocketAddress addr = (InetSocketAddress) endpoint;
            wrapped = (SSLSocket) sslFactory.createSocket(this, addr.getHostString(), addr.getPort(), true);
            wrapped.startHandshake();
        }

        @Override
        public java.io.InputStream getInputStream() throws IOException {
            return wrapped != null ? wrapped.getInputStream() : super.getInputStream();
        }

        @Override
        public java.io.OutputStream getOutputStream() throws IOException {
            return wrapped != null ? wrapped.getOutputStream() : super.getOutputStream();
        }

        @Override
        public void close() throws IOException {
            if (wrapped != null) {
                wrapped.close();
            } else {
                super.close();
            }
        }

        @Override
        public boolean isClosed() {
            return wrapped != null ? wrapped.isClosed() : super.isClosed();
        }
    }
}
