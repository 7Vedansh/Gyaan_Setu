import { StoredMicroLesson, StoredQuiz, StoredTopic } from "@/types/store";

export type TopicStageType = "microlesson" | "quiz";

export interface TopicStage {
  stage_id: string;
  source_topic_id: string;
  source_topic_order: number;
  stage_order: number;
  stage_type: TopicStageType;
  stage_index_within_type: number;
  microlessons: StoredMicroLesson[];
  quizzes: StoredQuiz[];
}

const DEFAULT_CHUNK_SIZE = 5;

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function buildTopicStages(
  topics: StoredTopic[],
  chunkSize = DEFAULT_CHUNK_SIZE
): TopicStage[] {
  const orderedTopics = topics
    .slice()
    .sort((a, b) => (a.topic_order ?? 0) - (b.topic_order ?? 0));

  const stages: TopicStage[] = [];
  let stageOrder = 0;

  for (const topic of orderedTopics) {
    const lessonChunks = chunk(topic.microlessons, chunkSize);
    const quizChunks = chunk(topic.quizzes, chunkSize);

    for (let i = 0; i < lessonChunks.length; i++) {
      const chunkItems = lessonChunks[i];
      if (chunkItems.length === 0) continue;

      stages.push({
        stage_id: `${topic.topic_id}:microlesson:${i + 1}`,
        source_topic_id: topic.topic_id,
        source_topic_order: topic.topic_order,
        stage_order: stageOrder++,
        stage_type: "microlesson",
        stage_index_within_type: i + 1,
        microlessons: chunkItems,
        quizzes: [],
      });
    }

    for (let i = 0; i < quizChunks.length; i++) {
      const chunkItems = quizChunks[i];
      if (chunkItems.length === 0) continue;

      stages.push({
        stage_id: `${topic.topic_id}:quiz:${i + 1}`,
        source_topic_id: topic.topic_id,
        source_topic_order: topic.topic_order,
        stage_order: stageOrder++,
        stage_type: "quiz",
        stage_index_within_type: i + 1,
        microlessons: [],
        quizzes: chunkItems,
      });
    }
  }

  return stages;
}

