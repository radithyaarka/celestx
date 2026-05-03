import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const ForceIncrement = () => {
    const [msg, setMsg] = useState('Wait...');
    useEffect(() => {
        if (chrome && chrome.storage) {
            chrome.storage.local.get(['sentimenta_total_indicated'], (res) => {
                const current = res.sentimenta_total_indicated || 100;
                chrome.storage.local.set({ sentimenta_total_indicated: current + 15 }, () => {
                    setMsg(`Success! Incremented from ${current} to ${current + 15}`);
                });
            });
        }
    }, []);
    return <div style={{padding: 20, fontSize: 20}}>{msg}</div>;
};

// We don't actually run this, we will execute it in the background page context.
