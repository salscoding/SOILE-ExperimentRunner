import { NodeInterface } from "@baklavajs/core";
import { CheckboxInterface, TextInterface } from "@baklavajs/renderer-vue";
import { allowMultipleConnections } from "@baklavajs/engine";
import { v4 as uuidv4 } from "uuid";
import { SideBarButton, ExperimentSideBarOption } from "../NodeOptions";
import { markRaw, reactive } from "vue";
import { displayInSideBar } from "./utilities";
import OutputListOption from "../NodeOptions/OutputListOption.vue";
import { ComponentInterface } from "../NodeInterfaces/ComponentInterface";
import { InputInterface } from "../NodeInterfaces/InputInterface";
import SoileVersionedNode from "./SoileVersionedNode";
import {
  getOutputsForExperiment,
  instantiateExperimentInProject,
} from "@/helpers/projecteditor/experimentConverter";
import SoileNode from "./SoileNode";

export default class ExperimentNode extends SoileVersionedNode {
  public type = "ExperimentNode";
  public objectType = "experiment";
  public random = false;
  public canRandom = true;
  public constructor() {
    super();
    this.myTitle = this.type;

    this.id = "Experiment " + uuidv4();
    this.initializeIo();
  }
  public inputs = {
    previous: new InputInterface("Previous", "InputConnection").use(
      allowMultipleConnections
    ),
    ExperimentName: new TextInterface(
      "ExperimentName",
      "Experiment: " + (this.objectData.name != "" ? this.objectData.name : "")
    ).setPort(false),
    ExperimentVersion: new TextInterface(
      "ExperimenVersion",
      "Version: " + this.objectData.tag ? this.objectData.tag : "UNVERSIONED"
    ).setPort(false),
    outputs: new ComponentInterface(
      "Outputs",
      { items: this.nodeOutputs, title: "Outputs" },
      OutputListOption
    ).setPort(false),
    // Potentially we don't need this, but it might be necessary.
    persistent: new ComponentInterface(
      "Persistent",
      { items: this.nodePersistent, title: "Persistent Data" },
      OutputListOption
    ).setPort(false),
    edit: new NodeInterface("Edit", undefined)
      .setComponent(markRaw(SideBarButton))
      .setPort(false),
    sideBarOption1: new ComponentInterface(
      "SideBar",
      this,
      ExperimentSideBarOption
    )
      .setHidden(true)
      .use(displayInSideBar, true)
      .setPort(false),
  };

  public outputs = {
    next: new NodeInterface("Next", "OutputConnection"),
  };
  public setName(name: string): void {
    this.inputs.ExperimentName.value = "Experiment: " + name;
  }
  public setTag(tag: string): void {
    console.log("Setting Tag to " + tag);
    this.inputs.ExperimentVersion.value = "Version: " + tag;
  }
  public async setElementVersion(version: string, tag: string): Promise<void> {
    await super.setElementVersion(version, tag);
    this.canRandom = await this.elementStore.canExperimentBeRandomized(
      this.objectData.UUID,
      this.objectData.version
    );
    console.log("Updating outputs");
    this.updateOutputs();
  }
  public updateOutputs() {
    getOutputsForExperiment(
      this.objectData.UUID,
      this.objectData.version,
      this.myTitle
    ).then((newOutputs) => {
      this.nodeOutputs.length = 0;
      this.nodeOutputs.push(...newOutputs);
    });
  }

  isValid() {
    return this.objectData.UUID != "" && this.objectData.version != "";
  }
  public isDataNode() {
    return true;
  }
}
