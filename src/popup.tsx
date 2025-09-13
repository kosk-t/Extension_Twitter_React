import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  // const [count, setCount] = useState(0);
  // const [currentURL, setCurrentURL] = useState<string>();

  // useEffect(() => {
  //   chrome.action.setBadgeText({ text: count.toString() });
  // }, [count]);

  // useEffect(() => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //     setCurrentURL(tabs[0].url);
  //   });
  // }, []);


  const getLike = () => {
    if(process.env.DEBUG){
      console.log("getLike");
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
        tab.id,
        {
          name: 'start',
          text: 'like'
        });
      }
    });
  };

  const getTweet = () => {
    if(process.env.DEBUG){
      console.log("getTweet");
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
        tab.id,
        {
          name: 'start',
          text: 'tweet'
        });
      }
    });
  };

  const getReply = () => {
    if(process.env.DEBUG){
      console.log("getReply");
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
        tab.id,
        {
          name: 'start',
          text: 'reply'
        });
      }
    });
  };

  const viewResult = () => {
    if(process.env.DEBUG){
      console.log("viewResult");
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
        tab.id,
        {
          name: 'view'
        });
      }
    });
  };


  return (
    <>
      <div id="GetLike" onClick={getLike} className='light button'>Getting Engagements👍🔁✉</div>
      {/* <div id="GetTweet" onClick={getTweet} className='light button'>Getting Quotes</div>
      <div id="GetReply" onClick={getReply} className='light button'>Getting Reply</div> */}
      <div id="view" onClick={viewResult} className='blue button'>View Result</div>
      <div><a href="https://note.com/kosk_t/n/n2d43c166e29b" target="_blank">{">"}Help Page</a></div>
      <div><a href="https://docs.google.com/spreadsheets/d/13mfT1n8f1357Nn99o4jrhZBopMJiiY3N6BhjoEx5nLc/edit?usp=sharing" target="_blank">{">"}Giveaway Tool</a></div>

    </>
  );
};

const root = createRoot(document.getElementById("content")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
