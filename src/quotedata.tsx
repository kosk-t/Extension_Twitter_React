import React from "react";
import { createRoot } from 'react-dom/client';

type ListData = { [key: string]: { displayName: string, article: string } };


chrome.runtime.sendMessage(
    { 
        type: "getdata"
    },
    function(response) {
    let listData = response.data;
    const myhtml = 
    <table style={{width: "80%", margin: "auto"}} >
        <thead><tr><th style={{minWidth: "10%"}}>Name</th><th style={{minWidth: "15%"}}>DisplayName</th><th style={{minWidth: "50%"}}>Article</th></tr></thead>
        <tbody>
        {Object.keys(listData).map((key) => (
            <tr key={key}>
                <td><a href={"https://twitter.com/" + listData[key].innerName.substring(1)} target='_blank'>{listData[key].innerName}</a></td>
                <td dangerouslySetInnerHTML={{__html:listData[key].displayName}}></td>
                <td dangerouslySetInnerHTML={{__html:listData[key].article}}></td>
            </tr>
        ))}
        </tbody>
    </table>;

    const container = document.getElementById('root')
    const root = createRoot(container!);
    root.render(myhtml);
});