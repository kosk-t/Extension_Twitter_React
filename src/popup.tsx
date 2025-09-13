import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [version, setVersion] = useState<string>("");
  const [currentURL, setCurrentURL] = useState<string | undefined>(undefined);

  useEffect(() => {
    const m = chrome.runtime.getManifest();
    setVersion(m.version || "");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0]?.url);
    });
  }, []);

  const isTwitterTab = useMemo(() => {
    if (!currentURL) return false;
    try {
      const u = new URL(currentURL);
      return u.hostname.endsWith("twitter.com") || u.hostname === "x.com" || u.hostname.endsWith(".x.com");
    } catch {
      return false;
    }
  }, [currentURL]);

  function notify(msg: string, timeout = 1200) {
    setStatus(msg);
    if (timeout > 0) {
      const id = setTimeout(() => setStatus(""), timeout);
      return () => clearTimeout(id);
    }
    return () => {};
  }

  function withBusy<T extends any[]>(fn: (...args: T) => void) {
    return (...args: T) => {
      if (busy) return;
      setBusy(true);
      try {
        fn(...args);
      } finally {
        setTimeout(() => setBusy(false), 400);
      }
    };
  }

  const sendToActive = (payload: any, okMsg?: string) => {
    if (!isTwitterTab) {
      notify("Twitter/X のタブで実行してください");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, payload, () => {
          if (okMsg) notify(okMsg);
        });
      }
    });
  };

  const getLike = withBusy(() => {
    if (process.env.DEBUG) console.log("getLike");
    sendToActive({ name: "start", text: "like" }, "取得を開始しました");
  });

  const getTweet = withBusy(() => {
    if (process.env.DEBUG) console.log("getTweet");
    sendToActive({ name: "start", text: "tweet" }, "取得を開始しました");
  });

  const getReply = withBusy(() => {
    if (process.env.DEBUG) console.log("getReply");
    sendToActive({ name: "start", text: "reply" }, "取得を開始しました");
  });

  const viewResult = withBusy(() => {
    if (process.env.DEBUG) console.log("viewResult");
    sendToActive({ name: "view" });
  });

  const openOptions = withBusy(() => {
    chrome.runtime.openOptionsPage();
  });

  return (
    <div className="popup-root">
      <div className="header">
        <div className="title">Twitter Reaction Counter</div>
        <div className="meta">v{version}</div>
      </div>

      {status && <div className="status">{status}</div>}

      <button id="GetLike" onClick={getLike} className={`button light ${busy ? "disabled" : ""}`} disabled={busy}>
        👍🔁✉ Engagements を取得
      </button>

      {/*
      <button onClick={getTweet} className={`button light ${busy ? "disabled" : ""}`} disabled={busy}>Quotes を取得</button>
      <button onClick={getReply} className={`button light ${busy ? "disabled" : ""}`} disabled={busy}>Replies を取得</button>
      */}

      <button id="view" onClick={viewResult} className={`button blue ${busy ? "disabled" : ""}`} disabled={busy}>
        結果を表示
      </button>

      <div className="links">
        <button className={`button light small ${busy ? "disabled" : ""}`} onClick={openOptions} disabled={busy}>設定</button>
        <a href="/privacy.html" target="_blank" rel="noreferrer">プライバシー</a>
        <a href="https://note.com/kosk_t/n/n2d43c166e29b" target="_blank" rel="noreferrer">ヘルプ</a>
        <a href="https://kosk-t.github.io/RandamSelection/" target="_blank" rel="noreferrer">Giveaway Tool</a>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("content")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

