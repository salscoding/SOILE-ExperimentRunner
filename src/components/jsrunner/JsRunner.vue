<template>
  <iframe
    style="width: 100%; height: 100%"
    ref="JSWindow"
    allowfullscreen
    :srcdoc="code"
  ></iframe>
</template>

<script>
export default {
  props: {
    code: {
      type: String,
      required: true,
    },
    persistentData: {
      default: {},
      type: Object,
    },
  },
  data() {
    return {
      results: {},
      files: [],
      persistent: {},
      outputValues: {},
    };
  },
  methods: {
    /**
     *
     * @param {*} data the data of the experiment.
     */
    handleData(data) {
      console.log(data);
      // merge the two.
      this.results = { ...this.resuls, ...data };
    },
    /**
     *
     * @param {*} data the data of the experiment.
     */
    saveData(key, value) {
      console.log(key);
      console.log(value);
      // merge the two.
      this.persistent[key] = value;
    },
    /**
     * Submit data
     */
    async submit() {
      try {
        const submitJson = this.buildResults();
        // clean up the page.
        this.$emit("handleSubmit", submitJson);
      } catch (error) {
        console.log(error);
        this.$emit("handleError", error);
      }
    },
    async submitFile(fileName, fileFormat, file) {
      console.log("Submitting file " + fileName + " with format " + fileFormat);
      console.log(file);
      this.$emit("handleUpload", { fileName, fileFormat, file });
    },
    /**
     * Build the persisten Object used for the task
     * @param {*} persistentDataArray
     */
    buildPersistentObject(persistentDataArray) {
      const persistent = {};
      persistentDataArray.forEach((element) => {
        persistent[element.name] = element.value;
      });
      return persistent;
    },

    /**
     * Parse the persistent object to the array required.
     * @param {*} objectToConvert
     * @param {boolean} resultHasToBeNumber
     */
    buildArrayFromObject(objectToConvert, resultHasToBeNumber) {
      const result = [];
      Object.keys(objectToConvert).forEach((element) => {
        objectOK = true;
        isJSON = true;
        try {
          JSON.stringify(objectToConvert[element]);
        } catch (err) {
          throw "Result object is not in a valid format.";
        }
        if (resultHasToBeNumber) {
          if (isNaN(objectToConvert[element])) {
            throw "Cannot convert Output to number";
          }
        }
        result.push({ name: element, value: objectToConvert[element] });
      });
      return result;
    },

    /**
     * Set a given output key to the given value
     * @param {*} key
     * @param {*} value
     */
    setOutput(key, value) {
      this.outputValues[key] = value;
    },
    /**
     * @return a json object that can be submitted to the SOILE backend
     */
    buildResults() {
      //TODO: Check whether there is a sensible way to allow outputs to be defined here.
      let jsonResults = [];
      for (let field in this.results) {
        jsonResults.push({ name: field, value: this.results[field] });
      }
      return {
        outputData: this.buildArrayFromObject(this.outputValues, true),
        resultData: { fileData: [], jsonData: jsonResults }, // files are handled at a higher level and added there.
        persistentData: this.buildArrayFromObject(this.persistent),
      };
    },
    handleError(error) {
      this.$emit("handleError", error);
    },
    resetData() {
      this.persistent = this.persistentData;
      this.outputValues = {};
      this.files = {};
      this.results = {};
    },
  },
  mounted() {
    this.resetData();
    const iframeWindow = this.$refs.JSWindow.contentWindow;
    this.persistent = this.persistentData;
    iframeWindow.persistentData = this.persistent;
    iframeWindow.submitFile = this.submitFile;
    iframeWindow.reportResult = this.handleData;
    iframeWindow.submitResults = this.submit;
    iframeWindow.handleError = this.handleError;
    iframeWindow.setOutput = this.setOutput;
    iframeWindow.setPersistent = this.saveData;
  },
  watch: {
    code() {
      // if the code changes, reset the data
      this.reset();
    },
  },
};
</script>

<style scoped></style>
