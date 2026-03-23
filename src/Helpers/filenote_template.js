export const fileNoteTemplate = (ref, sub, date) => {
  return {
    type: "doc",
    content: [
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: "paragraph",
                    attrs: { textAlign: "left" },
                    content: [
                      {
                        type: "text",
                        text: "Ref.No:",
                        marks: [{ type: "bold" }],
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: ref,
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: "paragraph",
                    attrs: { textAlign: "left" },
                    content: [
                      {
                        type: "text",
                        text: "Date:",
                        marks: [{ type: "bold" }],
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: "paragraph",
                    attrs: { textAlign: "left" },
                    content: [
                      {
                        type: "text",
                        text: date,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Subject:",
                        marks: [{ type: "bold" }],
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                attrs: { colspan: 3, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: "text",
                    text: sub,
                    marks: [{ type: "bold" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      { type: "paragraph" },
    ],
  };
};
