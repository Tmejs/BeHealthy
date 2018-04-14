# Wartości wzięte z https://sites.google.com/site/compendiumofphysicalactivities/Activity-Categories
MET_WALKING_UPHILL_1_5 = 5.3
MET_WALKING_UPHILL_6_15 = 8.0
MET_WALKING_DOWNHILL = 3.3
MET_WALKING_LEVEL = 4.3

MET_RUNNING_UPHILL_1_5 = 1.0
MET_RUNNING_UPHILL_6_15 = 3.0
MET_RUNNING_DOWNHILL = -1.2
MET_RUNNING_8KMH = 8.3
MET_RUNNING_10KMH = 9.1

UPHILL_TIME_OVER_DOWNHILL_TIME = 0.5


def walking_MET(up_grade):
    down_met = MET_WALKING_DOWNHILL

    # Ustawienie wspołczynnika MET w zależności od ostrości powierzchni
    if up_grade < 6.0:
        up_met = MET_WALKING_UPHILL_1_5
    else:
        up_met = MET_WALKING_UPHILL_6_15

    return down_met, up_met


def running_MET(speed, up_grade):
    if speed < 9.0:
        down_met = MET_RUNNING_8KMH
        up_met = MET_RUNNING_8KMH
    else:
        down_met = MET_RUNNING_10KMH
        up_met = MET_RUNNING_10KMH

    # Ustawienie wspołczynnika MET w zależności od ostrości powierzchni
    if 0.0 < up_grade < 6.0:
        up_met += MET_RUNNING_UPHILL_1_5
    elif up_grade >= 6.0:
        up_met += MET_RUNNING_UPHILL_6_15

    return down_met, up_met


def uphill_grade(length, uphill):
    return 100 * uphill / length


def calories_burned(uphill_in_km, length_in_km, time_in_h, activity, weight_in_kg):
    calories, down_met, up_met = 0, 0, 0
    up_grade = uphill_grade(length_in_km, uphill_in_km)
    speed = length_in_km / time_in_h

    if activity == "walking":
        down_met, up_met = walking_MET(up_grade)
    elif activity == "running":
        down_met, up_met = running_MET(speed, up_grade)

    calories += up_met * UPHILL_TIME_OVER_DOWNHILL_TIME * weight_in_kg * time_in_h

    calories += down_met * (1 - UPHILL_TIME_OVER_DOWNHILL_TIME) * weight_in_kg * time_in_h

    return calories


print(calories_burned(0.0, 3.5, 0.5, "running", 80))
