import tensorflow as tf
import numpy as np
from sklearn.model_selection import train_test_split

class Calories_Regressor:
    def __init__(self,  hidden_units=[500, 200, 50], batchsize=8, epochs=10):
        self.hidden_units = hidden_units
        self.batchsize = batchsize
        self.epochs = epochs

        self.feat_col = [tf.feature_column.numeric_column('x', shape=[])]
        self.estimator = tf.estimator.Estimator(
            model_fn=Calories_Regressor.model_func,
            params={
                'feature_columns': self.feat_col,
                'hidden_units': self.hidden_units,
            })

    @staticmethod
    def model_func(features, labels, mode, params):

        net = tf.feature_column.input_layer(features, params['feature_columns'])
        for units in params['hidden_units']:
            net = tf.layers.dense(net, units=units, activation=tf.nn.relu)
            net = tf.layers.dropout(inputs=net, rate=0.5)

        predicted_value = tf.layers.dense(net, units=1, activation=None)

        if mode == tf.estimator.ModeKeys.PREDICT:
            return tf.estimator.EstimatorSpec(mode, predictions={'predictions': predicted_value})

        # Compute loss.
        loss = tf.losses.mean_squared_error(labels=labels, predictions=predicted_value)

        # Compute evaluation metrics.
        accuracy = tf.metrics.accuracy(labels=labels,
                                       predictions=predicted_value,
                                       name='acc_op')
        metrics = {'accuracy': accuracy}
        tf.summary.scalar('accuracy', accuracy[1])

        if mode == tf.estimator.ModeKeys.EVAL:
            return tf.estimator.EstimatorSpec(
                mode, loss=loss, eval_metric_ops=metrics)

        # Create training op.
        assert mode == tf.estimator.ModeKeys.TRAIN

        optimizer = tf.train.AdagradOptimizer(learning_rate=0.3)
        train_op = optimizer.minimize(loss, global_step=tf.train.get_global_step())
        return tf.estimator.EstimatorSpec(mode, loss=loss, train_op=train_op)

    def prepare_model(self):
        self.read_data()

    def read_data(self):
        file_data = np.genfromtxt(self.filename, delimiter=',')
        file_data = np.delete(file_data, [0], axis=0)  # usuniecie nagłowka
        self.x_data = np.log(np.delete(file_data, [2 * self.dimensions], axis=1))  # wyodrębnienie współrzędnych
        self.y_data = np.log(np.delete(file_data, np.arange(2 * self.dimensions), axis=1))  # wyodrębnienie wyniku



        self.x_train, self.x_eval, self.y_train, self.y_eval = train_test_split(self.x_data, self.y_data,
                                                                                test_size=0.2, random_state=0)

    def train_model(self, x_train, y_train):
        self.input_func = tf.estimator.inputs.numpy_input_fn({'x': x_train}, y_train,
                                                             batch_size=self.batchsize, num_epochs=self.epochs,
                                                             shuffle=True)

        self.estimator.train(input_fn=self.input_func)

    def evaluate_model(self, x_eval, y_eval):
        self.eval_input_func = tf.estimator.inputs.numpy_input_fn({'x': x_eval}, y_eval,
                                                                  batch_size=self.batchsize, num_epochs=self.epochs,
                                                                  shuffle=False)
        self.eval_metrics = self.estimator.evaluate(input_fn=self.eval_input_func)

        return self.eval_metrics

    def predict(self, data):
        data = np.log(np.asarray(data))
        pred_input_func = tf.estimator.inputs.numpy_input_fn({'x': data}, shuffle=False)

        y_pred = []
        for pred in self.estimator.predict(input_fn=pred_input_func):
            y_pred.append(pred['predictions'])

        return np.exp(y_pred)
