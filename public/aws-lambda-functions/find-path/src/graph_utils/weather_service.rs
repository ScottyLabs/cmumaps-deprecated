use reqwest;
use serde::{Deserialize, Serialize};
use std::error::Error;

const PITTSBURGH_ZIP: &str = "15213";
const COUNTRY_CODE: &str = "US";

#[derive(Debug, Deserialize)]
struct WeatherResponse {
    main: MainWeather,
    weather: Vec<WeatherDescription>,
}

#[derive(Debug, Deserialize)]
struct MainWeather {
    temp: f32,
    feels_like: f32,
}

#[derive(Debug, Deserialize)]
struct WeatherDescription {
    main: String,
    description: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WeatherInfo {
    pub temperature: f32,
    pub feels_like: f32,
    pub condition: String,
}

pub async fn get_current_weather(api_key: &str) -> Result<WeatherInfo, Box<dyn Error>> {
    let url = format!(
        "https://api.openweathermap.org/data/2.5/weather?lon=-80&appid={}&lat=40.44",
        api_key
    );

    let response = reqwest::get(&url).await?;
    let response: String = response.text().await?;
    let response: WeatherResponse = serde_json::from_str(&response)?;

    Ok(WeatherInfo {
        temperature: response.main.temp,
        feels_like: response.main.feels_like,
        condition: response.weather[0].main.clone(),
    })
}

pub fn get_weather_multiplier(weather: &WeatherInfo) -> f32 {
    // Convert Kelvin to Fahrenheit for comparison
    let temp_f = (weather.feels_like - 273.15) * 9.0/5.0 + 32.0;
    
    // Good outdoor conditions: >55°F and not raining/snowing
    let is_precipitation = matches!(weather.condition.as_str(), "Rain" | "Snow" | "Thunderstorm");
    
    if temp_f > 55.0 && !is_precipitation {
        // Good weather - prefer outdoor paths
        0.001 // Multiplier < 1 makes outdoor paths more attractive
    } else {
        // All other cases - prefer indoor paths
        1000.0 // Multiplier > 1 makes indoor paths more attractive
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_weather_multiplier_good_conditions() {
        let weather = WeatherInfo {
            temperature: 288.15, // ~59°F
            feels_like: 288.15,  // ~59°F
            condition: "Clear".to_string(),
        };
        let multiplier = get_weather_multiplier(&weather);
        assert!(multiplier < 1.0); // Should prefer outdoor paths
    }

    #[test]
    fn test_weather_multiplier_cold() {
        let weather = WeatherInfo {
            temperature: 280.15, // ~45°F
            feels_like: 280.15,  // ~45°F
            condition: "Clear".to_string(),
        };
        let multiplier = get_weather_multiplier(&weather);
        assert!(multiplier > 1.0); // Should prefer indoor paths
    }

    #[test]
    fn test_weather_multiplier_rain() {
        let weather = WeatherInfo {
            temperature: 288.15, // ~59°F
            feels_like: 288.15,  // ~59°F
            condition: "Rain".to_string(),
        };
        let multiplier = get_weather_multiplier(&weather);
        assert!(multiplier > 1.0); // Should prefer indoor paths
    }
}
