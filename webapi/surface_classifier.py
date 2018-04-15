import tensorflow as tf
import numpy as np

n_images = 0
images_train = [ "załadowane obrazki" ]
labels_train = [ "załadowane odpowiadające kategorie"]
classes = ['forest', 'concrete', 'sand']
num_classes = len(classes)
train_path = 'super_legit_dataset.csv'
validation_size = 0.2
train_batch_size = 64

def pre_process_image(image, training):
    if training:
        image = tf.random_crop(image, size=[128, 128, 3])
        image = tf.image.random_flip_left_right(image)
        image = tf.image.random_hue(image, max_delta=0.05)
        image = tf.image.random_contrast(image, lower=0.3, upper=1.0)
        image = tf.image.random_brightness(image, max_delta=0.2)
        image = tf.image.random_saturation(image, lower=0.0, upper=2.0)

        image = tf.minimum(image, 1.0)
        image = tf.maximum(image, 0.0)
    else:
        image = tf.image.resize_image_with_crop_or_pad(image,
                                                       target_height=128,
                                                       target_width=128)

    return image


def random_batch():
    num_images = len(n_images)

    idx = np.random.choice(num_images,
                           size=train_batch_size,
                           replace=False)

    x_batch = images_train[idx, :, :, :]
    y_batch = labels_train[idx, :]

    return x_batch, y_batch

def create_weights(shape):
    return tf.Variable(tf.truncated_normal(shape, stddev=0.05))

def create_biases(size):
    return tf.Variable(tf.constant(0.05, shape=[size]))


def create_convolutional_layer(input,
                               num_input_channels,
                               conv_filter_size,
                               num_filters):
    weights = create_weights(shape=[conv_filter_size, conv_filter_size, num_input_channels, num_filters])
    biases = create_biases(num_filters)

    layer = tf.nn.conv2d(input=input,
                         filter=weights,
                         strides=[1, 1, 1, 1],
                         padding='SAME')

    layer += biases

    layer = tf.nn.max_pool(value=layer,
                           ksize=[1, 2, 2, 1],
                           strides=[1, 2, 2, 1],
                           padding='SAME')

    layer = tf.nn.relu(layer)

    return layer


def create_flatten_layer(layer):
    layer_shape = layer.get_shape()
    num_features = layer_shape[1:4].num_elements()
    layer = tf.reshape(layer, [-1, num_features])

    return layer


def create_fc_layer(input,
                    num_inputs,
                    num_outputs,
                    use_relu=True):
    weights = create_weights(shape=[num_inputs, num_outputs])
    biases = create_biases(num_outputs)

    layer = tf.matmul(input, weights) + biases
    if use_relu:
        layer = tf.nn.relu(layer)

    return layer


x = tf.placeholder(tf.float32, shape=[None, 128,128,3], name='x')

y_true = tf.placeholder(tf.float32, shape=[None, num_classes], name='y_true')
y_true_cls = tf.argmax(y_true, dimension=1)

filter_size_conv = [3,3,3]
num_filters_conv = [32,32,64]
layer_conv1 = create_convolutional_layer(input=x,
                                         num_input_channels=3,
                                         conv_filter_size=filter_size_conv[0],
                                         num_filters=num_filters_conv[0])

layer_conv2 = create_convolutional_layer(input=layer_conv1,
                                         num_input_channels=num_filters_conv[0],
                                         conv_filter_size=filter_size_conv[1],
                                         num_filters=num_filters_conv[1])

layer_conv3 = create_convolutional_layer(input=layer_conv2,
                                         num_input_channels=num_filters_conv[1],
                                         conv_filter_size=filter_size_conv[2],
                                         num_filters=num_filters_conv[2])

layer_flat = create_flatten_layer(layer_conv3)

layer_fc1 = create_fc_layer(input=layer_flat,
                            num_inputs=layer_flat.get_shape()[1:4].num_elements(),
                            num_outputs=128,
                            use_relu=True)

layer_fc2 = create_fc_layer(input=layer_fc1,
                            num_inputs=128,
                            num_outputs=num_classes,
                            use_relu=False)

cross_entropy = tf.nn.softmax_cross_entropy_with_logits(logits=layer_fc2,
                                                    labels=y_true)
cost = tf.reduce_mean(cross_entropy)
optimizer = tf.train.AdamOptimizer(learning_rate=1e-4).minimize(cost)
saver = tf.train.Saver()


def train(num_iteration):
    global total_iterations
    with tf.Session() as session:
        for i in range(total_iterations,
                       total_iterations + num_iteration):

            x_batch, y_true_batch = random_batch()

            feed_dict_tr = {x: x_batch,
                            y_true: y_true_batch}

            session.run(optimizer, feed_dict=feed_dict_tr)



        total_iterations += num_iteration
        saver.save(session, 'surface-model')
