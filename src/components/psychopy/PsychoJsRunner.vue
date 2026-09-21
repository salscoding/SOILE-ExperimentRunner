<template>
  <iframe ref="psychoJSWindow" allowfullscreen :srcdoc="code"></iframe>
</template>

<script>
export default {
  props: {
    psychoJSVersion: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  methods: {
    /**
     * Handle a submission of a JSON file coming from psychoJS.
     * In theory filename and mimetype are irrelevant...
     * TODO: Make this more versatile...
     * @param {*} filename
     * @param {*} data
     * @param {*} mimetype
     */
    handleData(filename, data, mimetype) {
      this.results = JSON.parse(data);
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
    /**
     * Handle an error that happened here.
     * @param {Error} error
     */
    handleError(error) {
      this.$emit("handleError", error);
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
        outputData: [],
        resultData: { fileData: [], jsonData: jsonResults },
      };
    },
  },
  mounted() {
    const iframeWindow = this.$refs.psychoJSWindow.contentWindow;
    iframeWindow.reportResult = this.handleData;
    iframeWindow.submitResult = this.submit;
    iframeWindow.handleError = this.handleError;
  },
};
</script>

<style scoped></style>
