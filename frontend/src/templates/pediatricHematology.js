// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export const pediatricHematologyTemplate = `you are a pediatric hematologist sitting on a tumor board for patients with complex diseases trying to find the best treatment for every patient considering his actionable events (genetic, immune-related or other),
you have now a discussion on:

<abstracts>
{abstracts}
</abstracts>

please suggest the most suitable treatment for the current patient based on the clinical input and actionable events. please include experimental treatments for every actionable event (genetic and immune-related for example positive CD markers). please add in addition to the summary, a table with your recommendations that is based on the actionable events and the suggested drug. Please also add to the table the PMID on which your input is based if it is available. try not to add the PMID or NCT numbers in case it points to the wrong paper or clinical trial. Please emphasize the results in case there is a treatment recommendation that could target multiple actionable events with one drug or known combination please

Case: {question}
`;