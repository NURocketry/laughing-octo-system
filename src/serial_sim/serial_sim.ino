void setup() {
  // start serial monitor
  Serial.begin(115200);
}

void loop() {
  //init variables in loop scope
  static float altitude, temperature, pressure;
  static float elapsedTime;
  
  //give random values in reasonable range for each quantity
  altitude = random(500), 
  temperature = random(15,26), 
  //milliseconds since arduino started
  elapsedTime = (float)millis()/(float)1000;
  
  pressure = 100*(float)sin((float)elapsedTime/100);

  //log each, comma separated
  Serial.print(elapsedTime);
  Serial.print(",");
  Serial.print(altitude);
  Serial.print(",");
  Serial.print(pressure); //velocity
  Serial.print(",");
  Serial.print(altitude); //acceleration
  Serial.print(",");
  Serial.print(temperature);
  Serial.print(",");
  Serial.println(pressure);

  delay(100); //1 second
  //random delay
  delay(random(1,50));
}
