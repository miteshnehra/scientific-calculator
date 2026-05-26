from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

def to_radians(value, angle_mode):
    if angle_mode == 'rad':
        return value
    elif angle_mode == 'grad':
        return value * math.pi / 200
    else:  # deg
        return value * math.pi / 180

def from_radians(value, angle_mode):
    if angle_mode == 'rad':
        return value
    elif angle_mode == 'grad':
        return value * 200 / math.pi
    else:  # deg
        return value * 180 / math.pi

def factorial(n):
    if n < 0 or not float(n).is_integer():
        raise ValueError("Factorial only defined for non-negative integers")
    if n > 170:
        raise ValueError("Number too large for factorial")
    return math.factorial(int(n))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    operation = data.get('operation')
    num1 = data.get('num1', 0)
    num2 = data.get('num2', 0)
    angle_mode = data.get('angle_mode', 'deg')

    try:
        result = None

        # Basic Arithmetic
        if operation == 'add':
            result = num1 + num2
        elif operation == 'subtract':
            result = num1 - num2
        elif operation == 'multiply':
            result = num1 * num2
        elif operation == 'divide':
            if num2 == 0:
                return jsonify({'error': 'Division by zero'}), 400
            result = num1 / num2
        elif operation == 'power':
            result = math.pow(num1, num2)

        # Trig Functions
        elif operation == 'sin':
            result = math.sin(to_radians(num1, angle_mode))
        elif operation == 'cos':
            result = math.cos(to_radians(num1, angle_mode))
        elif operation == 'tan':
            result = math.tan(to_radians(num1, angle_mode))
        elif operation == 'asin':
            if not (-1 <= num1 <= 1):
                return jsonify({'error': 'Domain error: asin requires -1 ≤ x ≤ 1'}), 400
            result = from_radians(math.asin(num1), angle_mode)
        elif operation == 'acos':
            if not (-1 <= num1 <= 1):
                return jsonify({'error': 'Domain error: acos requires -1 ≤ x ≤ 1'}), 400
            result = from_radians(math.acos(num1), angle_mode)
        elif operation == 'atan':
            result = from_radians(math.atan(num1), angle_mode)

        # Logarithms
        elif operation == 'log':
            if num1 <= 0:
                return jsonify({'error': 'Domain error: log requires x > 0'}), 400
            result = math.log10(num1)
        elif operation == 'ln':
            if num1 <= 0:
                return jsonify({'error': 'Domain error: ln requires x > 0'}), 400
            result = math.log(num1)

        # Roots & Powers
        elif operation == 'sqrt':
            if num1 < 0:
                return jsonify({'error': 'Domain error: sqrt requires x ≥ 0'}), 400
            result = math.sqrt(num1)
        elif operation == 'cbrt':
            result = math.copysign(abs(num1) ** (1/3), num1)
        elif operation == 'square':
            result = num1 ** 2
        elif operation == 'cube':
            result = num1 ** 3
        elif operation == 'reciprocal':
            if num1 == 0:
                return jsonify({'error': 'Division by zero'}), 400
            result = 1 / num1
        elif operation == 'abs':
            result = abs(num1)
        elif operation == 'factorial':
            result = factorial(num1)

        # Constants
        elif operation == 'pi':
            result = math.pi
        elif operation == 'e':
            result = math.e

        # Angle Conversions
        elif operation == 'deg_to_rad':
            result = num1 * math.pi / 180
        elif operation == 'rad_to_deg':
            result = num1 * 180 / math.pi
        elif operation == 'deg_to_grad':
            result = num1 * 10 / 9
        elif operation == 'grad_to_deg':
            result = num1 * 9 / 10

        else:
            return jsonify({'error': f'Unknown operation: {operation}'}), 400

        if result is None or (isinstance(result, float) and (math.isnan(result) or math.isinf(result))):
            return jsonify({'error': 'Math error: result is undefined'}), 400

        # Round to avoid floating point noise
        if isinstance(result, float):
            result = round(result, 10)

        return jsonify({'result': result})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Calculation error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
