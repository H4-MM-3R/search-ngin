import {HfInference} from "@huggingface/inference"

const hf = new HfInference("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")
export const vectorize = async (input: string): Promise<number[]> => {
  const embeddingResponse = await hf.featureExtraction({
    inputs:input,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  })

  //@ts-ignore
  return embeddingResponse
}
