#!/bin/bash
# This script tracks cpu utilization, cpu temperature, and memory usage
# Targets a Raspberry Pi 4, hence some hard coded values/logic
# Can provide a different time interval if desired
# Also writes to a file in CSV format. The file can be changed if a time interval is given

# Constants

# Figure out where the script is being called from to avoid issues with calling the script from different paths
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# Where log files are placed
DEFAULT_LOG_DIR="$SCRIPT_DIR/log_stats"
# Default time to record in seconds
DEFAULT_RECORDING_TIME=3600   # 3600s == 1h
# Location of CPU stats file
CPU_STATS_FILE="/proc/stat"
# How often to force a flush to disk in seconds
FLUSH_FREQ=60
# How many Hz in one MHz
MEGA_HERTZ=1000000

# Confirm we were given a valid number of iterations
if ! [[ "$1" =~ ([0-9]+$) ]]; then
	echo "Invalid logging interval given. Falling back to default recording time of $DEFAULT_RECORDING_TIME(s)"
	time=$DEFAULT_RECORDING_TIME
else
	time=$1
fi

# Check if we were given a log file. If so, use it. If not, use default location
if [[ -n ${2+x} ]]; then
	log_file=$2
else
	[ ! -d $DEFAULT_LOG_DIR ] && mkdir $DEFAULT_LOG_DIR
	file_num="$(ls -1 $DEFAULT_LOG_DIR | wc -l)"
	# Use name './log_stats/log_statXXX.csv' where XXX is the number of files currently present
	log_file="$DEFAULT_LOG_DIR/log$file_num.csv"
fi

echo "Writing data to $log_file"
echo ",System Time,CPU0 Usage (%),CPU1 Usage (%),CPU2 Usage (%),CPU3 Usage (%),CPU Usage (%),Arm Clock (Hz),Core Clock (Hz),H264 Clock (Hz),V3D Clock (Hz),CPU Temp (C),Allocated Memory (MiB),Free Memory (MiB),Total Memory (MiB),Memory Usage (%)" >> $log_file

# Print column headers
echo "Time |  C0 |  C1 |  C2 |  C3 | All |  Arm | Core | H264 | V3D | Thtld | Temp C | Mem Used/Free MiB"

for ((i=0; i<$time; i++)) do

	# Get aggregate and individual CPU usage
	for ((j=0; j<5; j++)) do

		# Unable to do arithmetic directly in the sed command
		sed_line=$(($j+1))
		cpu_now=($(sed "${sed_line}q;d" < $CPU_STATS_FILE))

		# Replace the ' 's with '+'s and exec since the numbers sum up to 100%
		cpu_sum[$j]="${cpu_now[@]:1}"
		cpu_sum[$j]=$((${cpu_sum[j]// /+}))

		# Get the delta between the time from now and 1 second ago
		cpu_delta[j]=$((cpu_sum[j] - cpu_last_sum[j]))


		# Get the idle time delta
		cpu_idle[j]=$((cpu_now[4] - cpu_last[j]))

		# All values aside from idle is time spent working
		cpu_used[j]=$((cpu_delta[j] - cpu_idle[j]))

		# Convert to %
		cpu_usage[j]=$((100 * cpu_used[j] / cpu_delta[j]))

		# Track the current values for next check
		cpu_last[j]=${cpu_now[4]}
		cpu_last_sum[j]=${cpu_sum[j]}
	
	done

	# Get clocks. Not sure which is which, get the 4 that seem most likely
	# Possible clocks from https://elinux.org/RPI_vcgencmd_usage :
	# arm, core, h264, isp, v3d, uart, pwm, emmc, pixel, vec, hdmi, dpi
	clk_arm="$(vcgencmd measure_clock arm 2> /dev/null | awk -F= '{print $2}')"
	clk_core="$(vcgencmd measure_clock core 2> /dev/null | awk -F= '{print $2}')"
	clk_h264="$(vcgencmd measure_clock h264 2> /dev/null | awk -F= '{print $2}')"
	clk_v3d="$(vcgencmd measure_clock v3d 2> /dev/null | awk -F= '{print $2}')"

	# Check if we are getting throttled. Apparently this happens when voltage is low
	throttled="$(vcgencmd get_throttled 2> /dev/null | awk -F= '{print $2}')"

	# Get temp. Use -1 as an error value
	if [[ "$(vcgencmd measure_temp 2> /dev/null)" =~ ([0-9]{2}\.[0-9]) ]]; then
		cpu_temp=${BASH_REMATCH[1]}
	else
		cpu_temp="-1"
	fi

	# Get memory usage
	ram_usage=($(free -m | sed '2q;d'))
	ram_total=$((ram_usage[1]))
	ram_used=$((ram_usage[2]))
	ram_free=$((ram_usage[3]))
	ram_percent=$((100 * ram_used / ram_total))

	# Print to screen and file
	printf "%4d | %3s | %3s | %3s | %3s | %3s | %4s | %4s | %4s | %3s | %5s | %4s'C | %4d/%4d (%3d%%)\n" $i ${cpu_usage[1]} ${cpu_usage[2]} ${cpu_usage[3]} ${cpu_usage[4]} ${cpu_usage[0]} $(($clk_arm / MEGA_HERTZ)) $(($clk_core / MEGA_HERTZ)) $(($clk_h264 / MEGA_HERTZ)) $(($clk_v3d / MEGA_HERTZ)) $throttled $cpu_temp $ram_used $ram_free $ram_percent
	echo "$i,$(date +%r),${cpu_usage[1]},${cpu_usage[2]},${cpu_usage[3]},${cpu_usage[4]},${cpu_usage[0]},$clk_arm,$clk_core,$clk_h264,$clk_v3d,$cpu_temp,$ram_used,$ram_free,$ram_total,$ram_percent" >> $log_file

	[ $(( $i % $FLUSH_FREQ )) -eq 0 ] && sync

	sleep 1
done
