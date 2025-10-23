#!/bin/bash

TOKEN="5--kBAZi9J-fPmYfbwaQaBEFLiFpJNTKe5o_YqYtHAM"

# Array of ID|Title pairs
declare -a updates=(
  "40520573|Carolyn Chen \"The 24\" (2016)"
  "40520574|Chloe Thompson @ Project Q (2018)"
  "40520576|Lea Bertucci @ Project Q (2018)"
  "40520577|Alec Hall + MarieVic \"Getting to We\" (2019) 02"
  "40520578|Jewish Voice for Peace @ Project Q (2018)"
  "40520580|Liminal (2017) 01"
  "40520582|Leilehua Lanzelotti @ Project Q (2018)"
  "40520583|\"Sick! The Psychoanalytic Field Hospital\" (2018) 01"
  "40520585|Liminal (2017) 00"
  "40520586|Machine Music (2014) 00"
  "40520587|Lester St Louis (2019)"
  "40520588|Machine Music (2014) 01"
  "40520589|21st Century Sound Stories (2018) 04"
  "40520592|David Bird \"How to\" (2019)"
  "40520593|21st Century Sound Stories (2018) 01"
  "40520595|21st Century Sound Stories (2018) 03"
  "40520596|21st Century Sound Stories (2018) 02"
  "40520597|21st Century Sound Stories (2018) 06"
  "40520598|21st Century Sound Stories (2018) 09"
  "40520599|21st Century Sound Stories (2018) 05"
  "40520600|21st Century Sound Stories (2018) 08"
  "40520601|21st Century Sound Stories (2018) 14"
  "40520602|21st Century Sound Stories (2018) 07"
  "40520603|21st Century Sound Stories (2018) 11"
  "40520605|(this is not a) Music Video (2021) 00"
  "40520606|21st Century Sound Stories (2018) 10"
  "40520607|21st Century Sound Stories (2018) 00"
  "40520608|21st Century Sound Stories (2018) 13"
  "40520609|21st Century Sound Stories (2018) 12"
  "40520610|(this is not a) Music Video (2021) 02"
  "40520611|\"Sick! The Psychoanalytic Field Hospital\" (2018) 03"
  "40520612|(this is not a) Music Video (2021) 03"
  "40520613|(this is not a) Music Video (2021) 01"
  "40520616|Magnitudes - Mari Ohno (2016) 03"
  "40520617|Magnitudes - Miya Masaoka (2016) 07"
  "40520618|Magnitudes - Alec Hall and Tyshawn Sorey (2016) 04"
  "40520619|Magnitudes - Alec Hall (2016) 05"
  "40520620|Merche Blasco (2022)"
  "40520621|Magnitudes - Alec Hall (2016) 00"
  "40520622|MATA Festival @ Project Q (2018)"
  "40520623|Magnitudes - Alec Hall (2016) 06"
  "40520624|Magnitudes - Alec Hall (2016) 01"
  "40520625|Magnitudes - Nolan Lem (2016) 00"
  "40520626|Noise Non-ference Printed Matter (2013)"
  "40520627|Nina Young Luke DuBois and Seth Cluett @ Project Q (2018) 00"
  "40520628|Nina Young Luke DuBois and Seth Cluett @ Project Q (2018) 01"
  "40520629|Matt Stevens @ Project Q (2018)"
  "40520630|Mivos Quartet @ Project Q (2018)"
  "40520632|Project Q Launch Party 00"
  "40520633|Out:With:In (2020) \"Yardwork\" 01"
  "40520634|Patrick Higgins @ Project Q (2018)"
  "40520635|Peripheral Visions @ Project Q (2018)"
  "40520636|Sarah Hennies @ Project Q (2018) 00"
  "40520637|Out:With:In (2020) \"Yardwork\" 00"
  "40520638|Out:With:In (2020) 02"
  "40520639|Project Q Launch Party 01"
  "40520640|ProjectQ Launch Party 02"
  "40520641|Sarah Hennies @ Project Q (2018) 01"
  "40520642|Out:With:In (2020) \"Yardwork\" 03"
  "40520643|Sarah Hennies and Meridian"
  "40520644|Sound Space Simulation (2016) 05"
  "40520645|Sound Space Simulation (2016) 00"
  "40520646|Sound Space Simulation (2016) 03"
  "40520647|Sound Space Simulation (2016) 04"
  "40520648|Sound Space Simulation (2016) 02"
  "40520649|Sound Space Simulation (2016) 01"
  "40520650|Sound Space Simulation (2016) 05"
  "40520651|Sound Space Simulation (2016) 06"
  "40520652|The Unwellness Center (2019) 01"
  "40520653|The Unwellness Center - \"theirs\" (2019) 00"
  "40520655|The Unwellness Center (2019) 00"
  "40520656|The Unwellness Center (2019) 00"
  "40520657|The Unwellness Center (2019) 01"
  "40520660|The Unwellness Center - \"theirs\" (2019) 03"
  "40520661|The Unwellness Center (2019) 05"
  "40520662|The Unwellness Center - \"theirs\" (2019) 02"
  "40520663|Tori Cheah @ Project Q (2018)"
  "40520664|Yotam Mann \"Blobchat\" @ Project Q (2018) 00"
  "40520665|Yotam Mann \"Blobchat\" @ Project Q (2018) 01"
  "40520666|The Unwellness Center - \"theirs\" (2019) 01"
  "40520667|The Unwellness Center - \"theirs\" (2019) 04"
  "40520668|The Unwellness Center (2019) 03"
  "40520669|The Unwellness Center (2019) 04"
  "40520907|Unofficial Whitney Biennial Audioguide Companion (2022) - High Line Performance 00"
  "40520909|Unofficial Whitney Biennial Audioguide Companion (2022) - High Line Performance 03"
  "40520910|Unofficial Whitney Biennial Audioguide Companion (2022) - High Line Performance 02"
  "40520911|Unofficial Whitney Biennial Audioguide Companion (2022) - High Line Performance 01"
  "40520912|Magnitudes - Miller Puckette and Jaime Oliver (2016)"
  "40521044|Magnitudes - Nolan Lem (2016) 01"
  "40521205|Rama Gottfried Innovator Lab (2024) 01"
)

count=0
for update in "${updates[@]}"; do
  IFS='|' read -r id title <<< "$update"
  echo "Updating $id: $title"

  # Escape quotes for JSON
  json_title=$(echo "$title" | sed 's/"/\\"/g')

  curl -s -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"$json_title\"}" \
    "https://api.are.na/v2/blocks/$id" > /dev/null

  ((count++))
  echo "✓ Updated ($count/${#updates[@]})"
  sleep 0.5
done

echo ""
echo "✓ All done! Updated $count blocks"
