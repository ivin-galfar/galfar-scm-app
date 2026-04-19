import {
  getEnclosureText,
  getFooterText,
  getFromValue,
  getToValue,
} from "./helperfunctions";

export const fileNoteTemplate = (ref, sub, date, type, category) => {
  let basecontent = [];

  if (type == "file_note") {
    basecontent = [
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
    ];
    if (category == "ADTSRen") {
      basecontent.push(
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We have received intimation from ADTS for security pass for ",
            },
            { type: "text", marks: [{ type: "underline" }], text: "  " },
            {
              type: "text",
              text: " units of our fleet. As per the ADTS guidelines, we are required to make a payment as mentioned in the proforma for the listed fleets to proceed with the issue of security pass. We have received an official notification from ADTS regarding the payment, amounting to AED",
            },
            {
              type: "text",
              marks: [{ type: "underline" }],
              text: "             ",
            },

            {
              type: "text",
              text: " (for ",
            },
            {
              type: "text",
              marks: [{ type: "underline" }],
              text: "   ",
            },
            {
              type: "text",
              text: " units due for renewal).",
            },
          ],
        },
        { type: "paragraph" },
        { type: "paragraph" },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Sl No." }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Project" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Units" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Amount" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Vat@5%" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Total" }],
                    },
                  ],
                },
              ],
            },
            // Empty row
            {
              type: "tableRow",
              content: Array(6)
                .fill(null)
                .map(() => ({
                  type: "tableCell",
                  content: [{ type: "paragraph" }],
                })),
            },
            // Last row with merged total
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  attrs: { colspan: 5 },
                  content: [
                    {
                      type: "paragraph",
                      attrs: { textAlign: "right" },
                      content: [
                        {
                          type: "text",
                          text: "Total",
                          marks: [{ type: "bold" }],
                        },
                      ],
                    },
                  ],
                },
                { type: "tableCell", content: [{ type: "paragraph" }] },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Copy of the notification are also attached herewith for reference.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The payment is essential to complete the approval process and to proceed with the necessary CICPA renewals.",
            },
          ],
        },
      );
    }
    if (category == "ADTSNew") {
      const footer = {
        type: "footer",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Regards," }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "(Pramoj Ramesh)" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: getEnclosureText(category) }],
          },
        ],
      };
      basecontent.push(
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We have been advised by ADTS to hire the fleet(s) as per following details, ",
            },
            { type: "text", marks: [{ type: "underline" }], text: "    " },
          ],
        },
        { type: "paragraph" },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Sl No." }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Reg No" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Description" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Hire Period (months)" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Hire charge month" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", text: "Total amount inclusive of VAT" },
                      ],
                    },
                  ],
                },
              ],
            },
            // Empty row
            {
              type: "tableRow",
              content: Array(6)
                .fill(null)
                .map(() => ({
                  type: "tableCell",
                  content: [{ type: "paragraph" }],
                })),
            },
            // Last row with merged total
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We request approval to release ",
            },
            { type: "text", marks: [{ type: "underline" }], text: "    " },

            {
              type: "text",
              text: " cheques for the above  ",
            },
            { type: "text", marks: [{ type: "underline" }], text: "   " },

            {
              type: "text",
              text: " equipment to pay for them monthly. The total cheque's value shall be AED ",
            },
            { type: "text", marks: [{ type: "underline" }], text: "     ." },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The payment is essential to complete the approval process and to proceed with the necessary CICPA renewals.",
            },
          ],
        },
      );
      basecontent.push(
        { type: "paragraph" },
        { type: "paragraph" },
        ...footer.content,
      );
    }

    if (category === "TFW") {
      basecontent.push(
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Details of traffic fine:",
            },
          ],
        },
        { type: "paragraph" },
      );

      const secondTable = {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              { text: "Sl.No.", widths: 50 },
              { text: "Veh. No", widths: 90 },
              { text: "Veh. type", widths: 90 },
              { text: "Owner", widths: 100 },
              { text: "Amount AED (After Discount)", widths: 120 },
              { text: "Fine Date", widths: 80 },
              { text: "Fine Details/Project", widths: 120 },
              { text: "Remarks", widths: 100 },
            ].map(({ text, widths }) => ({
              type: "tableHeader",
              attrs: { colspan: 1, rowspan: 1, colwidth: widths },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            })),
          },
          // Empty row
          {
            type: "tableRow",
            content: [
              { widths: 50 },
              { widths: 90 },
              { widths: 90 },
              { widths: 100 },
              { widths: 120 },
              { widths: 80 },
              { widths: 120 },
              { widths: 100 },
            ].map(({ widths }) => ({
              type: "tableCell",
              attrs: { colspan: 1, rowspan: 1, colwidth: widths },
              content: [{ type: "paragraph" }],
            })),
          },
          // Last row with Total under "Veh. type" (4th column)
          {
            type: "tableRow",
            content: [
              { widths: 50 },
              { widths: 80 },
              { widths: 90 },
              { widths: 90 },
              { widths: 100 },
              { widths: 120 },
              { widths: 80 },
              { widths: 120 },
            ].map(({ widths }, idx) => {
              if (idx === 3) {
                return {
                  type: "tableCell",
                  attrs: { colspan: 1, rowspan: 1, colwidth: widths },
                  content: [
                    {
                      type: "paragraph",
                      attrs: { textAlign: "right" },
                      content: [
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Total",
                        },
                      ],
                    },
                  ],
                };
              }
              return {
                type: "tableCell",
                attrs: { colspan: 1, rowspan: 1, colwidth: widths },
                content: [{ type: "paragraph" }],
              };
            }),
          },
        ],
      };

      basecontent.push(secondTable, { type: "paragraph" });
    }
  } else if (type == "ioc") {
    const footer = {
      type: "footer",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: getFooterText(category) }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: getEnclosureText(category) }],
        },
      ],
    };
    if (category != "Demob") {
      basecontent = [
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [
                    { type: "text", text: "To : " },
                    { type: "text", text: getToValue(category) },
                  ],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [{ type: "text", text: `Date: ${date}` }],
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
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "From : " },
                    { type: "text", text: getFromValue(category) },
                  ],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Ref : ${ref}` }],
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
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `SUB : ${sub}` }],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Page: 1 of 1` }],
                },
              ],
            },
          ],
        },
      ];
    } else {
      basecontent = [
        {
          type: "tableRow",
          content: [
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [{ type: "text", text: "From : " }],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [{ type: "text", text: `Ref : ${ref}` }],
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
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `To : ` }],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Date : ${date}` }],
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
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Cc : ` }],
                },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `sub : ${sub}` }],
                },
              ],
            },
          ],
        },
      ];
    }

    if (category == "Demob") {
      basecontent.push(
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Dear Sir,",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "We are hereby demobilizing the following fleet(s) from Project:         w.e.f.  ",
            },
            {
              type: "text",
              text: "                                                            .",
            },
          ],
        },
        { type: "paragraph" },
        { type: "paragraph" },
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Sl. No." }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Equipment No./Plate No." }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Equipment/Vehicle" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Company" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Remarks" }],
                },
              ],
            },
          ],
        },
        {
          type: "tableRow",
          content: Array(5)
            .fill(null)
            .map(() => ({
              type: "tableCell",
              content: [{ type: "paragraph", attrs: { textAlign: "center" } }],
            })),
        },
      );
    }

    if (category == "Insurance") {
      basecontent.push(
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Please approve to arrange Comprehensive insurance coverage for below listed new vehicle.",
            },
          ],
        },

        { type: "paragraph" },
        { type: "paragraph" },
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Sl. No." }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Chassis No." }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Make & Type" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Insurance Value (AED)" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Registration Types" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Seating Capacity" }],
                },
              ],
            },
          ],
        },
        {
          type: "tableRow",
          content: Array(6)
            .fill(null)
            .map(() => ({
              type: "tableCell",
              content: [{ type: "paragraph" }],
            })),
        },
      );
    }
    if (category == "FC") {
      basecontent.push(
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Please arrange the ADNOC Fuel Chip (Petrol) for the below listed vehicles. Mulkiya copy of the vehicle is enclosed herewith for your ready reference",
            },
          ],
        },

        { type: "paragraph" },
        { type: "paragraph" },
        {
          type: "tableRow",
          content: [
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Sl. No." }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Reg No." }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Make & Type" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "Monthly Required Limit (AED)" },
                  ],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Owner" }],
                },
              ],
            },
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Remarks" }],
                },
              ],
            },
          ],
        },
        {
          type: "tableRow",
          content: Array(6)
            .fill(null)
            .map(() => ({
              type: "tableCell",
              content: [{ type: "paragraph" }],
            })),
        },
      );
    }
    if (category == "PR") {
      basecontent.push(
        { type: "paragraph" },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "The below mentioned vehicle has been inspected by AI Masood Automobiles on ",
            },
            {
              type: "text",
              marks: [{ type: "underline" }],
              text: "              ",
            },
            {
              type: "text",
              text: " and returned to Murror on   ",
            },
            {
              type: "text",
              marks: [{ type: "underline" }],
              text: "          .",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Please find enclosed copy of the inspection report with cost of repairs/return and do the needful to remove Comprehensive Insurance coverage from our fleet. ",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Any deduction (i.e. insurance, registration expense and penalty before hiring to Galfar etc..) has to be taken care of a s per the hire contract.",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "You are requested to arrange for payment on or before   ",
            },
            {
              type: "text",
              marks: [{ type: "underline" }],
              text: "                     ",
            },
            {
              type: "text",
              text: "   expenses incurred in connection with the vehicles return has to be booked as under,",
            },
          ],
        },
        { type: "paragraph" },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Vehicle Reg. No. : ",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Vehicle Description :   ",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              marks: [{ type: "bold" }],
              text: "Project No. : ",
            },
          ],
        },
      );
    }
    if (category == "DPR") {
      basecontent.push(
        { type: "paragraph" },
        { type: "paragraph" },
        { type: "paragraph" },
      );
    }
    basecontent.push(
      { type: "paragraph" },
      { type: "paragraph" },
      ...footer.content,
    );
  }

  return {
    type: "doc",
    content: basecontent,
  };
};
