import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [statusKind, setStatusKind] = useState<"error" | "info" | "">("");
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

  function notify(msg: string, kind: "error" | "info" = "info", timeout = 1500) {
    setStatusKind(kind);
    setStatus(msg);
    if (timeout > 0) {
      const id = setTimeout(() => {
        setStatus("");
        setStatusKind("");
      }, timeout);
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

  const sendToActive = (payload: any) => {
    if (!isTwitterTab) {
      notify("Please run this on a Twitter/X tab", "error");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (!tab?.id) {
        notify("No active tab found", "error");
        return;
      }
      chrome.tabs.sendMessage(tab.id, payload, () => {
        if (chrome.runtime.lastError) {
          notify(`Failed: ${chrome.runtime.lastError.message}`, "error");
        }
      });
    });
  };

  const getLike = withBusy(() => {
    if (process.env.DEBUG) console.log("getLike");
    sendToActive({ name: "start", text: "like" });
  });

  const getTweet = withBusy(() => {
    if (process.env.DEBUG) console.log("getTweet");
    sendToActive({ name: "start", text: "tweet" });
  });

  const getReply = withBusy(() => {
    if (process.env.DEBUG) console.log("getReply");
    sendToActive({ name: "start", text: "reply" });
  });

  const viewResult = withBusy(() => {
    if (process.env.DEBUG) console.log("viewResult");
    sendToActive({ name: "view" });
  });

  // Options button removed by request

  return (
    <div className="popup-root">
      <div className="header">
        <div className="title">Twitter Reaction Counter</div>
        <div className="meta">v{version}</div>
      </div>

      {status && <div className={`status ${statusKind === 'error' ? 'error' : ''}`}>{status}</div>}

      <button id="GetLike" onClick={getLike} className={`button light ${busy ? "disabled" : ""}`} disabled={busy}>
        Fetch Engagements 👍🔁✉
      </button>

      {/*
      <button onClick={getTweet} className={`button light ${busy ? "disabled" : ""}`} disabled={busy}>Quotes を取得</button>
      <button onClick={getReply} className={`button light ${busy ? "disabled" : ""}`} disabled={busy}>Replies を取得</button>
      */}

      <button id="view" onClick={viewResult} className={`button blue ${busy ? "disabled" : ""}`} disabled={busy}>
        View Results
      </button>

      <div className="links">
        <a href="https://note.com/kosk_t/n/n2d43c166e29b" target="_blank" rel="noreferrer">Help</a>
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
