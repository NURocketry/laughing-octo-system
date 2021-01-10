void setup() {
  // start serial monitor
  Serial.begin(115200);
}

void loop() {
  //init variables in loop scope
  static float altitude, temperature, pressure, velocity;
  static unsigned long elapsedTime = millis();
  
  //give random values in reasonable range for each quantity
  altitude = random(500) / 2 + 16;
  temperature = random(15,26) * 7 - 3;
  velocity = random(15,26);
  pressure = 100*(float)sin((float)elapsedTime/10000);
  
  //log each, comma separated
  Serial.print(String(altitude)        + ","+
               String(temperature)     + ","+
               String(velocity)        + ","+
               String(pressure)         + ","+
               String(elapsedTime)     + "\n" );


  //  delay(1000); //1 second
  //random delay
  delay(random(1,50));
}
