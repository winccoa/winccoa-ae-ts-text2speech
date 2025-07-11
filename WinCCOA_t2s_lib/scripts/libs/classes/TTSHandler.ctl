// $License: NOLICENSE
//--------------------------------------------------------------------------------
/**
  @file $relPath
  @copyright $copyright
  @author Matthias Stadter
*/

//--------------------------------------------------------------------------------
// Libraries used (#uses)

//--------------------------------------------------------------------------------
// Variables and Constants

//--------------------------------------------------------------------------------
/**
*/
class TTSHandler
{
  private string sTtsConfigDpe;
  private mapping mTtsConfig;
//--------------------------------------------------------------------------------
//@public members
//--------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  /** The Default Constructor.
  */
  public TTSHandler(string configDpe = "TTS_engine_config.")
  {
    DebugTN("TTSHandler created");
    this.sTtsConfigDpe = configDpe;
    Initialize();
  }

  ~TTSHandler()
  {
    DebugTN("TTSHandler destroyed");
  }

  public mapping getTtsConfig()
  {
    return this.mTtsConfig;
  }

  public void setTtsConfig(mapping mConfig)
  {
    this.mTtsConfig = mConfig;
    string sJsonConfig = jsonEncode(mConfig);
    dpSet(this.sTtsConfigDpe, sJsonConfig);
  }

  public string getTtsConfigDpe()
  {
    return this.sTtsConfigDpe;
  }

//--------------------------------------------------------------------------------
//@protected members
//--------------------------------------------------------------------------------

//--------------------------------------------------------------------------------
//@private members
//--------------------------------------------------------------------------------
  private void Initialize()
  {
    dpConnect(this, configDpeChanged, true, this.sTtsConfigDpe);
  }

  private void configDpeChanged(string sDpe1, string sJsonConfig)
  {
    this.mTtsConfig = jsonDecode(sJsonConfig);
    DebugTN("TTSHandler config changed: ", this.mTtsConfig);
  }
};
