use std::io::{Read, Write};
use std::net::{IpAddr, Ipv4Addr, SocketAddr, TcpStream};
use std::time::Duration;

pub const WORKSPACE: &str = "http://127.0.0.1:5173/";
const MAX_RESPONSE: u64 = 16384;

pub fn navigation_allowed(url: &str) -> bool {
    url.starts_with(WORKSPACE)
        || matches!(url, "tauri://localhost/" | "tauri://localhost/index.html" | "http://tauri.localhost/" | "http://tauri.localhost/index.html")
}

pub fn valid_health(raw: &[u8]) -> bool {
    if raw.len() as u64 > MAX_RESPONSE { return false; }
    let Ok(text) = std::str::from_utf8(raw) else { return false; };
    let Some((head, body)) = text.split_once("\r\n\r\n") else { return false; };
    let status = head.lines().next().unwrap_or("");
    if !status.starts_with("HTTP/1.1 200 ") && !status.starts_with("HTTP/1.0 200 ") { return false; }
    let Ok(value) = serde_json::from_str::<serde_json::Value>(body) else { return false; };
    value["ok"] == true && value["configured"] == true && value["mode"] == "local-built"
}

fn probe_at(address: SocketAddr) -> bool {
    let Ok(mut stream) = TcpStream::connect_timeout(&address, Duration::from_millis(800)) else { return false; };
    if stream.set_read_timeout(Some(Duration::from_millis(800))).is_err() || stream.set_write_timeout(Some(Duration::from_millis(800))).is_err() { return false; }
    if stream.write_all(b"GET /api/health HTTP/1.0\r\nHost: 127.0.0.1:5173\r\nConnection: close\r\n\r\n").is_err() { return false; }
    let mut raw = Vec::new();
    if stream.take(MAX_RESPONSE + 1).read_to_end(&mut raw).is_err() { return false; }
    valid_health(&raw)
}

pub fn workspace_ready() -> bool {
    // No URL, host, port or credential can be supplied by the web renderer or command line.
    probe_at(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 5173))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

    #[test]
    fn native_01_status_and_configured_built_mode_required() {
        let response = b"HTTP/1.0 200 OK\r\nContent-Type: application/json\r\n\r\n{\"ok\":true,\"configured\":true,\"mode\":\"local-built\"}";
        assert!(valid_health(response));
        for body in ["{}", "{\"ok\":true,\"configured\":false,\"mode\":\"local-built\"}", "{\"ok\":true,\"configured\":true,\"mode\":\"local-development\"}", "<html>not health</html>"] {
            assert!(!valid_health(format!("HTTP/1.1 200 OK\r\n\r\n{body}").as_bytes()));
        }
        assert!(!valid_health(b"HTTP/1.1 302 Found\r\nLocation: https://example.com\r\n\r\n{}"));
        assert!(!valid_health(&vec![b'x'; 16385]));
    }

    #[test]
    fn native_02_navigation_stays_in_local_workspace_or_static_help() {
        for url in [WORKSPACE, "http://127.0.0.1:5173/api/health", "tauri://localhost/index.html", "http://tauri.localhost/index.html"] { assert!(navigation_allowed(url)); }
        for url in ["https://example.com", "file:///C:/secret", "javascript:alert(1)", "http://127.0.0.1:5174/", "http://127.0.0.1:5173.evil.com/", "http://user@127.0.0.1:5173/", "http://localhost:5173/", "http://tauri.localhost/other.html"] { assert!(!navigation_allowed(url)); }
    }

    #[test]
    fn native_03_bounded_loopback_http_probe() {
        let listener = TcpListener::bind((Ipv4Addr::LOCALHOST, 0)).unwrap();
        let address = listener.local_addr().unwrap();
        let thread = std::thread::spawn(move || {
            let (mut socket, _) = listener.accept().unwrap();
            let mut input = [0u8; 1024];
            let size = socket.read(&mut input).unwrap();
            assert!(String::from_utf8_lossy(&input[..size]).starts_with("GET /api/health HTTP/1.0"));
            socket.write_all(b"HTTP/1.0 200 OK\r\n\r\n{\"ok\":true,\"configured\":true,\"mode\":\"local-built\"}").unwrap();
        });
        assert!(probe_at(address));
        thread.join().unwrap();
    }
}
