import { useEffect } from "preact/hooks";
import { render } from "preact";
import { Router } from "preact-router";
import { createClient } from "@supabase/supabase-js";

import Header from "./components/header/header";
import Aside from "./components/aside/aside";

import Home from "./pages/home/home";
import About from "./pages/about/about";
import Links from "./pages/links/links";
import Archive from "./pages/archive/archive";

import "./app.css";

const supabase = createClient(
  "https://umbczydkwxjdfzhsndxm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtYmN6eWRrd3hqZGZ6aHNuZHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4Mzk2NDgsImV4cCI6MjA2ODQxNTY0OH0.8cZIyecMqhUO5subqlZhzbWKDIaSrWLmgYewdH6h4VM"
);

function App() {
  useEffect(() => {
    let storage;
    try {
      storage =
        typeof localStorage !== "undefined" ? localStorage : sessionStorage;
    } catch {
      storage = sessionStorage;
    }

    const hasVisited = storage.getItem("has-visited");

    async function recordVisit() {
      if (!hasVisited) {
        try {
          const res = await fetch("https://ipapi.co/json");
          const geo = await res.json();

          const insertData = {
            ip_address: geo.ip,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
            country: geo.country_name,
            city: geo.city,
          };

          const { error } = await supabase.from("visits").insert([insertData]);
          if (!error) {
            storage.setItem("has-visited", "true");
          }
        } catch (e) {
          await supabase.from("visits").insert({});
        }
      }
    }

    recordVisit();
  }, []);

  return (
    <>
      <Header />
      <div className="main-area">
        <Aside />
        <Router>
          <Home default />
          <About path="/about" />
          <Links path="/links" />
          <Archive path="/archive" />
        </Router>
      </div>
    </>
  );
}

render(<App />, document.getElementById("root"));
