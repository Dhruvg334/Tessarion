# Evaluation Results
Chunks: 11
Queries: 12

{
  "sparse": {
    "Recall@3": 0.875,
    "Recall@5": 0.9166666666666666,
    "MRR@5": 0.875,
    "nDCG@5": 0.8756787557424589,
    "Context Precision@5": 0.8541666666666666
  },
  "pseudoDense": {
    "Recall@3": 0.9583333333333334,
    "Recall@5": 0.9583333333333334,
    "MRR@5": 0.8611111111111112,
    "nDCG@5": 0.8578939574213802,
    "Context Precision@5": 0.8472222222222223
  },
  "hybridUnweighted": {
    "Recall@3": 0.875,
    "Recall@5": 0.9166666666666666,
    "MRR@5": 0.9166666666666666,
    "nDCG@5": 0.9041954087945628,
    "Context Precision@5": 0.8916666666666666
  },
  "hybridCalibrated": {
    "Recall@3": 0.875,
    "Recall@5": 0.9166666666666666,
    "MRR@5": 0.9166666666666666,
    "nDCG@5": 0.906434609611504,
    "Context Precision@5": 0.8958333333333334
  },
  "localRerank": {
    "Recall@3": 0.9166666666666666,
    "Recall@5": 0.9166666666666666,
    "MRR@5": 0.9166666666666666,
    "nDCG@5": 0.9099767324290156,
    "Context Precision@5": 0.9027777777777777
  }
}