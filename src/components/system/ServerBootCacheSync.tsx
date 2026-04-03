"use client";

import { useEffect } from "react";
import { clearSession } from "@/lib/auth/session";

const SERVER_BOOT_COOKIE_NAME = "his_server_boot";
const SERVER_BOOT_STORAGE_KEY = "his.serverBoot";

const readCookie = (name: string) => {
  const target = `${name}=`;
  const pieces = document.cookie.split(";");
  for (const piece of pieces) {
    const trimmed = piece.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
};

const removeHisPrefixedKeys = (storage: Storage) => {
  const keys = Object.keys(storage);
  for (const key of keys) {
    if (key.startsWith("his.")) {
      storage.removeItem(key);
    }
  }
};

export default function ServerBootCacheSync() {
  useEffect(() => {
    const serverBoot = readCookie(SERVER_BOOT_COOKIE_NAME);
    if (!serverBoot) return;

    const savedBoot = localStorage.getItem(SERVER_BOOT_STORAGE_KEY);
    if (!savedBoot) {
      localStorage.setItem(SERVER_BOOT_STORAGE_KEY, serverBoot);
      return;
    }

    if (savedBoot === serverBoot) return;

    clearSession();
    removeHisPrefixedKeys(localStorage);
    removeHisPrefixedKeys(sessionStorage);
    localStorage.setItem(SERVER_BOOT_STORAGE_KEY, serverBoot);
    window.location.replace("/login");
  }, []);

  return null;
}
