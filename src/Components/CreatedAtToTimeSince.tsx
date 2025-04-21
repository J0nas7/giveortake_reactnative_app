import { useEffect, useState } from "react";

export const CreatedAtToTimeSince = ({ dateCreatedAt }: { dateCreatedAt: string }) => {
    const createdAt = new Date(dateCreatedAt);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    };

    if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`; // "x minutes ago"
    } else if (diffHours < 24 && createdAt.getDate() === now.getDate()) {
        return `today, ${formatTime(createdAt)}`; // "today, HH:mm"
    } else if (diffDays === 1 || (diffHours < 48 && createdAt.getDate() === now.getDate() - 1)) {
        return `yesterday, ${formatTime(createdAt)}`; // "yesterday, HH:mm"
    } else if (diffDays <= 5) {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return `${weekdays[createdAt.getDay()]}, ${formatTime(createdAt)}`; // "Weekday, HH:mm"
    } else {
        return createdAt.toLocaleString()
    }
}

export const SecondsToTimeDisplay = ({ totalSeconds }: { totalSeconds: number }) => {
    const [formattedTime, setFormattedTime] = useState<string>('')

    useEffect(() => {
        // Calculate seconds, minutes, and hours
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        // Format the time as hh:mm:ss
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        setFormattedTime(formattedTime);
    }, [totalSeconds])

    return <>{formattedTime}</>
}