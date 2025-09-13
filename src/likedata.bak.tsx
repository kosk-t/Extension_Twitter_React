import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

type ListData = { [key: string]: { displayName: string, isFollowed: boolean, bio: string } };

const App = () => {
    const [listData, setListData] = useState<ListData>({});

    // // データをセットする関数
    // const handleSetListData = (newData: ListData) => {
    //     setListData(newData);
    // };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        setListData(request.data)
    });

    chrome.storage.sync.get('listdata', ( data ) => {
        setListData(data.listdata)
    });
    return (
    <table style={{width: "80%", margin: "auto"}} >
        <thead><tr><th style={{minWidth: "10%"}}>Name</th><th style={{minWidth: "15%"}}>DisplayName</th><th style={{minWidth: "5%"}}>Followed</th><th style={{minWidth: "50%"}}>Bio</th></tr></thead>
        <tbody>
        {Object.keys(listData).map((key) => (
            <tr key={key}>
                <td><a href="https://twitter.com/${key.substring(1)" target='_blank'>{key}</a></td>
                <td>{listData[key].displayName}</td>
                <td>{listData[key].isFollowed ? 'Yes' : 'No'}</td>
                <td>{listData[key].bio}</td>
            </tr>
        ))}
        </tbody>
    </table>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
