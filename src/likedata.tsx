import React from "react";
import { createRoot } from 'react-dom/client';

type ListData = { [key: string]: { displayName: string, isFollowed: boolean, bio: string } };

chrome.runtime.sendMessage(
    { 
        type: "getdata"
    },
    function(response) {
    let listData = response.data;
    const myhtml = 
    <table style={{width: "80%", margin: "auto"}} >
        <thead><tr><th style={{minWidth: "10%"}}>Name</th><th style={{minWidth: "15%"}}>DisplayName</th><th style={{minWidth: "5%"}}>Followed</th><th style={{minWidth: "50%"}}>Bio</th></tr></thead>
        <tbody>
        {Object.keys(listData).map((key) => (
            <tr key={key}>
                <td><a href={"https://twitter.com/" + key.substring(1)} target='_blank'>{key}</a></td>
                <td dangerouslySetInnerHTML={{__html:listData[key].displayName}}></td>
                <td>{listData[key].isFollowed ? 'Yes' : 'No'}</td>
                <td dangerouslySetInnerHTML={{__html:listData[key].bio}}></td>
            </tr>
        ))}
        </tbody>
    </table>;

    const container = document.getElementById('root')
    const root = createRoot(container!);
    root.render(myhtml);
});
