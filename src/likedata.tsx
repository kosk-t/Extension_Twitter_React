import React, { useMemo, useState } from "react";
import { createRoot } from 'react-dom/client';

type ListData = { [key: string]: { displayName: string; isFollowed: boolean; bio: string } };

const LikedDataPage = ({ data }: { data: ListData }) => {
  const names = useMemo(() => Object.keys(data), [data]);
  const [status, setStatus] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const copyNames = async () => {
    const text = names.join("\n");
    try {
      if (navigator.clipboard && (window as any).isSecureContext !== false) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setStatus(`Copied ${names.length} names`);
      setTimeout(() => { setStatus(""); setCopied(false); }, 1500);
    } catch (e) {
      setStatus('Copy failed');
      setTimeout(() => setStatus(""), 1800);
    }
  };

  return (
    <div className="like-page">
      <div className="toolbar">
        <div className="toolbar-title">
          Like Results <span className="count-pill">{names.length}</span>
        </div>
        <button className="btn btn-primary" onClick={copyNames} title="Copy only the Name column">
          @ Copy Names
        </button>
      </div>
      {status && <div className="notice success">{status}</div>}
      <table className="like-table">
        <thead>
          <tr>
            <th style={{ minWidth: '10%' }}>Name</th>
            <th style={{ minWidth: '15%' }}>DisplayName</th>
            <th style={{ minWidth: '5%' }}>Followed</th>
            <th style={{ minWidth: '50%' }}>Bio</th>
          </tr>
        </thead>
        <tbody>
          {names.map((key) => (
            <tr key={key}>
              <td><a href={"https://twitter.com/" + key.substring(1)} target='_blank' rel="noreferrer">{key}</a></td>
              <td dangerouslySetInnerHTML={{ __html: data[key].displayName }}></td>
              <td>{data[key].isFollowed ? 'Yes' : 'No'}</td>
              <td className="txt" dangerouslySetInnerHTML={{ __html: data[key].bio }}></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

chrome.runtime.sendMessage(
  { type: "getdata" },
  function (response) {
    const listData: ListData = response.data || {};
    const container = document.getElementById('root');
    const root = createRoot(container!);
    root.render(<LikedDataPage data={listData} />);
  }
);
