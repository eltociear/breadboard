/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";

const simplePrompt = new Board();
const kit = simplePrompt.addKit(Starter);

const completion = kit.textCompletion();
kit.secrets(["API_KEY"]).wire("API_KEY", completion);
simplePrompt
  .input()
  .wire(
    "text->question",
    kit
      .textTemplate(
        "Analyze the following question and instead of answering, list out steps to take to answer the question: {{question}}",
        { $id: "analyze-this" }
      )
      .wire(
        "prompt->text",
        completion.wire("completion->text", simplePrompt.output())
      )
  );

export default simplePrompt;
