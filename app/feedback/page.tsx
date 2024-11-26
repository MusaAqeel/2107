"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";
import { Input } from "@/components/ui/input";

const Feedback = () => {
    const [feedbackText, setFeedbackText] = useState("");

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const email = "your-email@example.com";
        const subject = "Feedback Submission";
        const body = feedbackText;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h1>Feedback</h1>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <Input
                    data-testid="textInput"
                    placeholder="Write your feedback here"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                />
                <Button
                    variant="outline"
                    size="lg"
                    type="submit"
                    data-testid="submitButton"
                >
                    Submit
                </Button>
            </form>
        </div>
    );
};

export default Feedback;