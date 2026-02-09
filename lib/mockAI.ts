export interface AIResponse {
  text: string;
  isLocal: boolean;
  confidence: number;
}

const localResponses: Record<string, string[]> = {
  algebra: [
    "Great question! In algebra, we use letters like 'x' to represent unknown values. Think of it like a mystery box - the letter holds a number we need to find!",
    "Variables are simply placeholders for numbers. When you see 'x + 5 = 10', you're looking for what number, when added to 5, gives you 10.",
    "To solve for x, remember: whatever you do to one side of the equation, you must do to the other side. It's all about keeping balance!",
    "Like terms are terms that have the same variable. For example, 3x and 5x are like terms because they both have 'x'. You can add them to get 8x!",
  ],
  geometry: [
    "Geometry is all about shapes and space! We study points, lines, angles, and figures to understand the world around us.",
    "A triangle has three sides and three angles. The sum of all angles in a triangle is always 180 degrees!",
    "The area of a rectangle is length × width. Remember: area measures the space inside a shape.",
  ],
  physics: [
    "Newton's First Law says an object stays at rest or in motion unless a force acts on it. Think of a ball - it won't move until you push it!",
    "Speed = Distance ÷ Time. If you travel 100 km in 2 hours, your speed is 50 km/h.",
    "Energy cannot be created or destroyed, only transformed from one form to another.",
  ],
  general: [
    "That's a great question! Let me break it down for you step by step.",
    "I understand what you're asking. Here's a simple way to think about it...",
    "Let me help you understand this concept better with an example.",
  ],
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectTopic(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (
    lowerQuery.includes("algebra") ||
    lowerQuery.includes("variable") ||
    lowerQuery.includes("equation") ||
    lowerQuery.includes("solve")
  ) {
    return "algebra";
  }
  if (
    lowerQuery.includes("geometry") ||
    lowerQuery.includes("shape") ||
    lowerQuery.includes("angle") ||
    lowerQuery.includes("triangle")
  ) {
    return "geometry";
  }
  if (
    lowerQuery.includes("physics") ||
    lowerQuery.includes("force") ||
    lowerQuery.includes("motion") ||
    lowerQuery.includes("energy")
  ) {
    return "physics";
  }
  return "general";
}

export async function getLocalAIResponse(query: string): Promise<AIResponse> {
  await delay(800 + Math.random() * 700);

  const topic = detectTopic(query);
  const responses = localResponses[topic] || localResponses.general;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  return {
    text: randomResponse,
    isLocal: true,
    confidence: 0.7 + Math.random() * 0.2,
  };
}

export async function getCloudAIResponse(query: string): Promise<AIResponse> {
  await delay(1200 + Math.random() * 800);

  const topic = detectTopic(query);
  const responses = localResponses[topic] || localResponses.general;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  const enhancedResponse = `${randomResponse}\n\nHere's an additional tip: Practice makes perfect! Try working through a few examples to reinforce your understanding.`;

  return {
    text: enhancedResponse,
    isLocal: false,
    confidence: 0.85 + Math.random() * 0.1,
  };
}

export async function getAIResponse(
  query: string,
  forceLocal: boolean = false
): Promise<AIResponse> {
  const isOnline =
    typeof navigator !== "undefined" && "onLine" in navigator
      ? navigator.onLine
      : true;

  if (isOnline && !forceLocal) {
    try {
      return await getCloudAIResponse(query);
    } catch {
      return await getLocalAIResponse(query);
    }
  }

  return await getLocalAIResponse(query);
}

export function speakText(
  text: string,
  options?: {
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options?.onError?.("Speech synthesis is not supported in this environment.");
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang ?? "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () =>
    options?.onError?.("Speech synthesis failed to play.");

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}

export function startListening(
  onResult: (text: string) => void,
  onError: (error: string) => void,
  lang: string = "en-US"
): (() => void) | null {
  if (typeof window === "undefined") {
    onError("Speech recognition is not available in this environment.");
    return null;
  }

  const SpeechRecognition =
    // @ts-expect-error - SpeechRecognition is not in the default DOM typings
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition is not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang;

  recognition.onresult = (event: any) => {
    const transcript = Array.from(event.results)
      .map((result: any) => result[0].transcript)
      .join("");
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error ?? "Speech recognition error.");
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
}
