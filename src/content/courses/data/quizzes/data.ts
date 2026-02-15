import { Quiz } from "@/types/course";

const quizData: Quiz[] = [
    {
        id: 1,
        title: "Physics Basics",
        description: "Learn the fundamentals of physics.",
        subject: "Physics",
        questions: [
            { question: "What is the unit of force?", options: ["Newton", "Joule", "Pascal"], answer: "Newton" },
            { question: "What is the speed of light?", options: ["3x10^8 m/s", "1x10^6 m/s", "5x10^7 m/s"], answer: "3x10^8 m/s" },
        ],
    },
    {
        id: 2,
        title: "Chemistry Reactions",
        description: "Understand chemical reactions.",
        subject: "Chemistry",
        questions: [
            { question: "What is the chemical formula of water?", options: ["H2O", "CO2", "O2"], answer: "H2O" },
            { question: "What is the pH of a neutral solution?", options: ["7", "1", "14"], answer: "7" },
        ],
    },
];

export {quizData}