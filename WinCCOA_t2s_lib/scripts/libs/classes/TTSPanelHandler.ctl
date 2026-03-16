#uses "classes/TTSHandler"

class TTSPanelHandler
{
  private shared_ptr<TTSHandler> m_ttsHandler;
  private int m_managerNum;
  private string m_filterDpe;
  private string m_dpesDpe;

  public TTSPanelHandler(int managerNum)
  {
    DebugN("TTSPanelHandler created for manager: " + managerNum);
    m_managerNum = managerNum;

    string configDpe = "TTS_engine_" + managerNum + ".config";
    m_filterDpe = "TTS_engine_" + managerNum + ".filter";
    m_dpesDpe = "TTS_engine_" + managerNum + ".dpes";

    // Create TTSHandler
    m_ttsHandler = new TTSHandler(configDpe);

    // Connect to datapoints with this object as context
    dpConnect(this, this.onFilterChanged, TRUE, m_filterDpe);
    dpConnect(this, this.onDpesChanged, TRUE, m_dpesDpe);
  }

  ~TTSPanelHandler()
  {
    DebugN("TTSPanelHandler destroyed for manager: " + m_managerNum);
  }

  public void loadConfig()
  {
    string configDpe = "TTS_engine_" + m_managerNum + ".config";

    setValue("txtConfigDpe", "text", configDpe);
    setValue("txtFilterDpe", "text", m_filterDpe);

    if (!dpExists(configDpe)) {
      setValue("txtStatus", "text", "Datapoint not found");
      setValue("txtStatus", "backCol", "red");
      enableControls(false);
      return;
    }

    mapping config = m_ttsHandler.getTtsConfig();

    if (mappinglen(config) > 0) {
      // Check if availableVoices exists
      if (!mappingHasKey(config, "availableVoices")) {
        DebugN("ERROR: availableVoices key not found in config!");
        setValue("txtStatus", "text", "Configuration error");
        setValue("txtStatus", "backCol", "red");
        return;
      }

      // Set voice dropdown
      dyn_string voices = config["availableVoices"];
      setValue("cmbVoice", "items", voices);
      setValue("cmbVoice", "text", config["voice"]);

      // Set language dropdown
      dyn_string languages = makeDynString("en-US", "en-GB", "de-DE", "fr-FR", "es-ES", "it-IT", "ja-JP", "zh-CN");
      setValue("cmbLanguage", "items", languages);
      setValue("cmbLanguage", "text", config["language"]);

      // Set slider range (1-30 for 0.1x to 3.0x)
      setValue("sldSpeed", "minimum", 1);
      setValue("sldSpeed", "maximum", 30);
      setValue("sldSpeed", "value", (int)((float)config["speed"] * 10));
      string speedStr;
      sprintf(speedStr, "%.1f", (float)config["speed"]);
      setValue("txtSpeed", "text", speedStr + "x");

      setValue("spnQueueSize", "text", (int)config["maxQueueSize"]);

      bool initialized = config["isInitialized"];
      setValue("txtStatus", "text", initialized ? "Ready" : "Initializing...");
      setValue("txtStatus", "backCol", initialized ? "_Window" : "yellow");
    }

    // Load initial filter value
    string currentFilter;
    dpGet(m_filterDpe, currentFilter);
    setValue("txtFilter", "text", currentFilter);

    // Load initial DPEs
    dyn_string currentDpes;
    dpGet(m_dpesDpe, currentDpes);

    // Clear table and populate with DPEs
    setValue("lstFilteredDpes", "deleteAllLines");
    for (int i = 1; i <= dynlen(currentDpes); i++) {
      setValue("lstFilteredDpes", "appendLine", "#1", currentDpes[i]);
    }
    setValue("txtDpeCount", "text", "Filtered DPEs: " + dynlen(currentDpes));

    enableControls(true);
  }

  public string getConfigDpe()
  {
    return "TTS_engine_" + m_managerNum + ".config";
  }

  public int getManagerNum()
  {
    return m_managerNum;
  }

  private void onFilterChanged(string dpe, string filter)
  {
    setValue("txtFilter", "text", filter);
  }

  private void onDpesChanged(string dpe, dyn_string dpes)
  {
    // Clear table and populate with DPEs
    setValue("lstFilteredDpes", "deleteAllLines");
    for (int i = 1; i <= dynlen(dpes); i++) {
      setValue("lstFilteredDpes", "appendLine", "#1", dpes[i]);
    }
    setValue("txtDpeCount", "text", "Filtered DPEs: " + dynlen(dpes));
  }

  private void enableControls(bool enable)
  {
    setValue("cmbVoice", "enabled", enable);
    setValue("cmbLanguage", "enabled", enable);
    setValue("sldSpeed", "enabled", enable);
    setValue("spnQueueSize", "enabled", enable);
    setValue("btnApply", "enabled", enable);
    setValue("txtFilter", "enabled", enable);
    setValue("btnApplyFilter", "enabled", enable);
    setValue("txtTestMessage", "enabled", enable);
    setValue("btnTestMessage", "enabled", enable);
    setValue("btnClearQueue", "enabled", enable);
  }
};

