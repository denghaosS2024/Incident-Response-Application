import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import Organization from "../pages/Organization";

export default {
  title: "Pages/Organization",
  component: Organization,
} as ComponentMeta<typeof Organization>;

const Template: ComponentStory<typeof Organization> = (args) => <Organization {...args} />;

export const Default = Template.bind({});
Default.args = {};
