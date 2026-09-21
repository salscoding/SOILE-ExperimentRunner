import { describe, it, expect, vi } from "vitest";

import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";

import { createTestingPinia } from "@pinia/testing";
import WelcomeView from "@/views/WelcomeView.vue";
import { ProjectList } from "../../components";
import { router } from "@/helpers/router";
import i18n from "@/i18n";

describe("WelcomeView", () => {
  it("renders correctly", async () => {
    const wrapper = mount(WelcomeView, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: true }),
          PrimeVue,
          router,
          i18n,
        ],
      },
    });
    expect(wrapper.findComponent(ProjectList).exists()).toBe(true);
  });
});
