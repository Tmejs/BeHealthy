import tensorflow as tf


class CaloriesRegressor:
    def __init__(self):
        gender = tf.feature_column.categorical_column_with_vocabulary_list(
            "gender", vocabulary_list=["male", "female"])
        activity = tf.feature_column.categorical_column_with_vocabulary_list(
            "activity", vocabulary_list=["walking", "running", "cycling"])
        age = tf.feature_column.numeric_column("age")
        age_buckets = tf.feature_column.bucketized_column(
            age, boundaries=[18, 25, 30, 35, 40, 45, 50, 55, 60, 65])
        weight = tf.feature_column.numeric_column("weight")
        distance = tf.feature_column.numeric_column("distance")
        uphill = tf.feature_column.numeric_column("uphill")
        downhill = tf.feature_column.numeric_column("downhill")
        time = tf.feature_column.numeric_column("time")

        self.estimator = tf.estimator.LinearRegressor(
            feature_columns=[gender, activity, age_buckets, weight, distance, uphill, downhill, time],
            model_dir='./calories-model'
        )

    def train(self, x_train, y_train):
        self.estimator.train(input_fn=tf.estimator.inputs.numpy_input_fn(x={"x": x_train}, y=y_train,
                                                                         num_epochs=8, shuffle=True),
                             steps=y_train.size)
