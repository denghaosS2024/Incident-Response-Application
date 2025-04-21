import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import DrugEntry, {
  DrugEntryHandle,
} from "../components/feature/Reach911/DrugEntry";

const meta: Meta<typeof DrugEntry> = {
  title: "FindHospital/DrugEntry",
  component: DrugEntry,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isReadOnly: {
      control: "boolean",
      description: "Whether the component is in read-only mode",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DrugEntry>;

export const Empty: Story = {
  args: {
    isReadOnly: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export const ReadOnly: Story = {
  args: {
    isReadOnly: true,
  },
  decorators: [
    (Story) => {
      const ref = React.useRef<DrugEntryHandle>(null);

      React.useEffect(() => {
        const mockDrugsData = [
          { name: "Aspirin", dosage: "500mg", route: "PO" },
          { name: "Morphine", dosage: "15mg", route: "IV" },
        ];

        setTimeout(() => {
          const mockDrugsHtml = mockDrugsData
            .map(
              (drug, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; 
                        padding: 16px; margin-bottom: 8px; background-color: white; 
                        border-radius: 4px; border: 1px solid #e0e0e0;">
              <span>${drug.name}</span>
            </div>
          `,
            )
            .join("");

          const container = document.querySelector('[class*="MuiBox-root"]');
          if (container) {
            const grayBox = container.querySelector('[class*="MuiPaper-root"]');
            if (grayBox) {
              const emptyText = grayBox.querySelector("p");
              if (emptyText) {
                emptyText.style.display = "none";
                const drugsContainer = document.createElement("div");
                drugsContainer.style.paddingTop = "8px";
                drugsContainer.innerHTML = mockDrugsHtml;
                grayBox.appendChild(drugsContainer);
              }
            }
          }
        }, 500);
      }, []);

      return (
        <div style={{ width: "400px" }}>
          <Story />
        </div>
      );
    },
  ],
};
