#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod health;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri::menu::MenuBuilder;

fn help_url() -> &'static str {
    if cfg!(target_os = "windows") { "http://tauri.localhost/index.html" } else { "tauri://localhost/index.html" }
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if !args.is_empty() {
        if args.len() == 1 && args[0] == "--probe" {
            let ready = health::workspace_ready();
            println!("JARVIS built workspace ready: {ready}");
            std::process::exit(if ready { 0 } else { 1 });
        }
        if args.len() == 1 && (args[0] == "--version" || args[0] == "--help") {
            println!("JARVIS OS Desktop Preview 0.1.0\nSource: {}\nStart 02-Start-JARVIS.bat first. --probe checks only fixed local health; no credentials read.", option_env!("JARVIS_SOURCE_SHA").unwrap_or("source-checkout"));
            return;
        }
        eprintln!("Unsupported desktop option. No custom URL or command is accepted.");
        std::process::exit(2);
    }
    tauri::Builder::default()
        .setup(|app| {
            let url = if health::workspace_ready() {
                WebviewUrl::External(health::WORKSPACE.parse()?)
            } else { WebviewUrl::App("index.html".into()) };
            WebviewWindowBuilder::new(app, "main", url)
                .title("JARVIS OS — Desktop Preview")
                .inner_size(1360.0, 900.0)
                .min_inner_size(900.0, 640.0)
                .on_navigation(|url| health::navigation_allowed(url.as_str()))
                .on_new_window(|_, _| tauri::webview::NewWindowResponse::Deny)
                .build()?;
            let menu = MenuBuilder::new(app)
                .text("workspace", "Open local workspace / افتح مساحة العمل")
                .text("help", "Startup help / مساعدة التشغيل")
                .separator()
                .text("quit", "Quit desktop window / اقفل النافذة")
                .build()?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            if event.id().as_ref() == "quit" { app.exit(0); return; }
            if let Some(window) = app.get_webview_window("main") {
                let target = if event.id().as_ref() == "workspace" && health::workspace_ready() { health::WORKSPACE } else { help_url() };
                if let Ok(url) = target.parse() { let _ = window.navigate(url); }
            }
        })
        .run(tauri::generate_context!())
        .expect("Desktop host could not start. Check Microsoft WebView2 and use browser mode if unavailable.");
}
