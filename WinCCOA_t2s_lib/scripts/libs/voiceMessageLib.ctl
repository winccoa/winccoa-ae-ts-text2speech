struct Message {
  int managerNumber;
  string dpe;
  string text;
  string voice;
  int speed;
  int priority;
};

void sendMessage(string text, int prio, string dpe = "", int manNum = 256, string voice = "", int speed = 1)
{
  Message msg;
  msg.text = text;
  msg.priority = prio;
  msg.dpe = dpe;
  msg.speed = speed;
  msg.managerNumber = manNum;
  msg.voice = voice;
  string str = jsonEncode(msg);
  dpSet("Text2SpeechMsg.message", str);
}
