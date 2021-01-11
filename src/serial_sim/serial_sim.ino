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
  elapsedTime = millis()/10;
  
  pressure = 100*(float)sin((float)elapsedTime/10000);

  //log each, comma separated
  Serial.print(altitude);
  Serial.print(",");
  Serial.print(temperature);
  Serial.print(",");
  Serial.print(pressure);
  Serial.print(",");
  Serial.print(pressure);
  Serial.print(",");
  Serial.println(elapsedTime);

//  delay(1000); //1 second
  //random delay
  delay(random(1,50));
}
