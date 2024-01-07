---
title: Home Sensors
date: 2017-02-12
tags: embedded
---

I've been recently inspired to do some IoT stuff, more specifically, make an automated system to collect data and visualize it.

For example, I have a standing desk at my job and it would be interesting to see how the working hours is divided between standing and sitting modes.

In addition to that, some data from home would be nice to have.

## Standing Desk

I ordered a [ESP8266 ESP-01](https://www.sparkfun.com/products/13678){target='\_blank'} WiFi module [(2 €)](http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2047675.m570.l1313.TR0.TRC0.H0.XESP8266+ESP-01.TRS0&_nkw=ESP8266+ESP-01&_sacat=0) in order to get the data out in the wild.

I'm planning to use an [ultrasonic distance sensor](https://www.sparkfun.com/products/13959) [(1 €)](http://www.ebay.com/sch/i.html?_sacat=0&_nkw=ultrasonic+distance+sensor&_frs=1) to measure the desk's heigh and an [infrared PIR motion sensor](https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor/overview) [(1 €)](http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2047675.m570.l1313.TR0.TRC0.H0.XHC-SR501.TRS0&_nkw=HC-SR501&_sacat=0) to detect if anyone is working on the desk.

## Home Sensors

I want to collect data of the room's temperature, humidity and whatever I can easily collect.

For temperature, I have a couple of options.

| Name                                             | Temperature accuracy                    | Humidity accuracy | Price at Ebay                                                                                                                                      | Other              |
| ------------------------------------------------ | --------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [DHT22](https://www.adafruit.com/products/385)   | ± 0.5 °C                                | ± 2-5 %           | [2.6 €](http://www.ebay.com/sch/i.html?_odkw=SHT31-D&_osacat=0&_from=R40&_trksid=p2045573.m570.l1313.TR0.TRC0.H0.Xdht22.TRS0&_nkw=dht22&_sacat=0)  |                    |
| [MPC9808](https://www.adafruit.com/product/1782) | ± 0.25 °C typical, 0.0625 °C resolution | -                 | [6 €](http://www.ebay.com/sch/i.html?_from=R40&_trksid=p2047675.m570.l1313.TR0.TRC0.H0.XMCP9808.TRS0&_nkw=MCP9808&_sacat=0)                        | No humidity sensor |
| [SHT31-D](https://www.adafruit.com/product/2857) | ± 0.3 °C                                | ± 2 %             | [6 €](http://www.ebay.com/sch/i.html?_odkw=BMP280&_osacat=0&_from=R40&_trksid=p2045573.m570.l1313.TR0.TRC0.H0.XSHT31-D.TRS0&_nkw=SHT31-D&_sacat=0) |                    |

For atmospheric pressure, the [BMP280](https://learn.adafruit.com/adafruit-bmp280-barometric-pressure-plus-temperature-sensor-breakout/overview) [(2 €)](http://www.ebay.com/sch/i.html?_odkw=dht22&_osacat=0&_from=R40&_trksid=p2045573.m570.l1313.TR0.TRC0.H0.XBMP280+.TRS0&_nkw=BMP280+&_sacat=0) is a great option.

Other than air measurements, I figured to measure plants' soil moisture. For that I'll propably order [cheaper versions](http://www.ebay.com/itm/5-Pcs-Soil-Humidity-Hygrometer-Sensor-Module-Moisture-Detection-For-AVR-NEW-/222071266556?hash=item33b47a9cfc:g:FAYAAOSwS7hW~eaK) of [these](https://www.sparkfun.com/products/13322).

After those, everyhting is _just_ software. I have to try out some IoT platforms or to implement the analysis part myself...
