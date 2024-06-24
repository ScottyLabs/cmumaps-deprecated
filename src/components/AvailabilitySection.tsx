import React, { useMemo, useState, memo, useEffect } from "react";
import clsx from "clsx";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";


export interface AvailabilitySectionProps {
  availability: object;
}

/**
 * Displays the search results.
 */
export default function AvailabilitySection({
  availability,
}: AvailabilitySectionProps) {
  const [background, setBackground] = useState("#fff");
  const [classNow, setClassNow] = useState("");

  function makeAvailEle(dow: number) {
    let availDay = availability[String(dow)];

    if (!availDay) return [<div className="rounded-[4px] opacity-80 bg-collection-1-highlight ml-2 mr-2 mt-3 mb-0"><p className="ml-2" key="bad">No time info</p></div>];

    availDay.sort((s1, s2) => {
      if (s1[0][0] == s2[0][0]) return 0;
      // console.log(s1[0][0], s2[0][0], cmpTime(s1[0][0], s2[0][0]))
      switch (cmpTime(s2[0][0], s1[0][0])) {
        case "GREATER":
          return 1;
        case "LESS":
          return -1;
      }
    });
    return availDay.map((s) => (
      <div className="rounded-[4px] opacity-80 bg-blur-sm bg-collection-1-highlight ml-2 mr-2 mt-0 mb-0"> <p className="mt-1 mb-1" key={s[0][0] + s[1]}>{s[1] + ": " + s[0][0] + ", " + s[0][1]}</p> </div>
    ));
  }
  function whatsNow() {
    let date = new Date();
    let dow = date.getDay();
    let time =
      date.toLocaleTimeString("en-US", { timeZone: "EST" }).slice(0, 5) +
      date.toLocaleTimeString("en-US", { timeZone: "EST" }).slice(-2);
    let availDay = availability[String(dow)];
    if (!availDay) {
      return false;
    }
    let current = availDay.find(
      (a) =>
        cmpTime(time, a[0][0]) == "GREATER" && cmpTime(time, a[0][1]) == "LESS"
    );

    // if(current){setBackground("#fdd")}
    // else{setBackground("#dfd");}
    setClassNow(current ? current[1] : null);
  }
  function cmpTime(T1, T2) {
    if (
      (T1.slice(-2) == "PM" && T2.slice(-2) == "AM") ||
      parseInt(T2.slice(0, 2)) < parseInt(T1.slice(0, 2)) ||
      (parseInt(T1.slice(0, 2)) == parseInt(T2.slice(0, 2)) &&
        parseInt(T2.slice(3, 5)) < parseInt(T1.slice(3, 5)))
    )
      return "LESS";
    return "GREATER";
  }
  useEffect(() => {
    whatsNow();
  });
  return (
    <div className="rounded-[8px] ml-1 mr-1 pt-1 pb-1 bg-collection-1-background">
      <p className="ml-2 mt-2">{classNow ? classNow + " is now." : "No class now!"}</p>
      <Tabs
        defaultActiveKey="profile"
        id="uncontrolled-tab-example"
        className="mb-1 border-none"
        fill={true}
      >
        <Tab id="tabs" eventKey="U" title="U" tabClassName="tab">
          {makeAvailEle(7)}
        </Tab>
        <Tab eventKey="M" title="M">
          {makeAvailEle(1)}
        </Tab>
        <Tab eventKey="T" title="T">
          {makeAvailEle(2)}
        </Tab>
        <Tab eventKey="W" title="W">
          {makeAvailEle(3)}
        </Tab>
        <Tab eventKey="R" title="R">
          {makeAvailEle(4)}
        </Tab>
        <Tab eventKey="F" title="F">
          {makeAvailEle(5)}
        </Tab>
        <Tab eventKey="S" title="S">
          {makeAvailEle(6)}
        </Tab>
      </Tabs>
    </div>
  );
}
