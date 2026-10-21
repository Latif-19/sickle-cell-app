import type { QuizQuestion } from '../types/database';

export const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What does having an 'AS' genotype mean?",
    options: [
      "You have Sickle Cell Disease and severe symptoms.",
      "You are a carrier of the sickle cell trait, usually healthy, but can pass the gene to children.",
      "You have completely normal hemoglobin with no sickle gene present.",
      "You have Hemoglobin C disease."
    ],
    correctAnswer: 1,
    explanation: "'AS' indicates Sickle Cell Trait. Carriers possess one normal hemoglobin gene (A) and one sickle hemoglobin gene (S). They generally lead symptom-free lives."
  },
  {
    id: 2,
    question: "If two parents both carry the 'AS' genotype (trait carriers), what is the chance of having a child with 'SS' (Sickle Cell Disease)?",
    options: [
      "0% chance",
      "25% chance with each pregnancy",
      "50% chance with each pregnancy",
      "100% chance"
    ],
    correctAnswer: 1,
    explanation: "For two AS carriers, with each pregnancy there is a 25% chance of AA (normal), a 50% chance of AS (carrier), and a 25% chance of SS (sickle cell disease)."
  },
  {
    id: 3,
    question: "Which of the following couples has ZERO risk of having a child with Sickle Cell Disease (SS)?",
    options: [
      "AA and AS",
      "AS and AS",
      "AS and SS",
      "SS and SS"
    ],
    correctAnswer: 0,
    explanation: "An AA parent will always pass an 'A' gene, ensuring every child receives at least one healthy 'A'. Hence, a child from AA and AS can only be AA or AS, never SS."
  },
  {
    id: 4,
    question: "What is a 'Vaso-occlusive Crisis' in sickle cell disease?",
    options: [
      "A sudden loss of blood pressure during exercise.",
      "Blockage of small blood vessels caused by stiff, sickle-shaped red blood cells, causing intense pain.",
      "An allergic reaction to high altitudes.",
      "A deficiency of vitamin C."
    ],
    correctAnswer: 1,
    explanation: "Sickled red blood cells become rigid and curved, clumping together in capillaries, restricting blood flow and oxygen to tissues, which triggers painful crises."
  },
  {
    id: 5,
    question: "Which of these is a vital lifestyle tip to prevent pain crises in sickle cell patients?",
    options: [
      "Staying well hydrated and avoiding extreme cold or dehydration",
      "Skipping meals and excessive fasting",
      "Avoiding all vaccines",
      "Consuming high amounts of iron supplements without medical guidance"
    ],
    correctAnswer: 0,
    explanation: "Hydration keeps blood viscosity lower, and avoiding temperature extremes helps prevent sudden vasoconstriction and sickle cell polymerisation."
  }
];
