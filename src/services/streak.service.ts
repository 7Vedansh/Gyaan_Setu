export type FriendStreak = {
    id: string;
    name: string;
    streak: number;
    avatar?: string;
    invite?: boolean;
};

export function getMockStreak() {
    return {
        currentStreak: 12,
        longestStreak: 21,
        goal: 30,
        calendar: [
            { day: "M", active: true },
            { day: "T", active: true },
            { day: "W", active: true },
            { day: "T", active: false },
            { day: "F", active: true },
            { day: "S", active: true },
            { day: "S", active: false },
        ]
    };
}

export function getMockFriendsStreak(): FriendStreak[] {
    return [
        { id: "1", name: "memo:)", streak: 125, avatar: "https://i.pravatar.cc/150?img=1" },
        { id: "2", name: "Alex", streak: 45, avatar: "https://i.pravatar.cc/150?img=2" },
        { id: "3", name: "Sarah", streak: 12, avatar: "https://i.pravatar.cc/150?img=3" },
        { id: "4", name: "Invite a friend", streak: 0, invite: true },
        { id: "5", name: "Invite a friend", streak: 0, invite: true }
    ];
}
