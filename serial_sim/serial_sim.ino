void setup() {
  // start serial monitor
  Serial.begin(115200);
}

void loop() {
  //init variables in loop scope
  static int altitude, temperature, pressure;
  static unsigned long elapsedTime;
  
  //give random values in reasonable range for each quantity
  altitude = random(500), 
  temperature = random(15,26), 
  pressure = random(950,1051);
  //milliseconds since arduino started
  elapsedTime = millis();

  //log each, comma separated
  Serial.print(altitude);
  Serial.print(",");
  Serial.print(temperature);
  Serial.print(",");
  Serial.print(pressure);
  Serial.print(",");
  Serial.println(elapsedTime);

  //random delay
  delay(random(1,50));
}
