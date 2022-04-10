# DatePicker

Without jQuery-based date component with support for date ranges, muitiple calendars and more.

## Params

- el: 
    - type: **Element**
    - required: `true`
    - description: Calendar container
- trigger:
    - type: **Element**
    - required: `true`
    - description: Provoke DatePicker show and hide
    - eg: `input element`(onfocus show the DatePicker)
- default:
    - type: **String**
    - default: `'today'`
    - eg: `'2017-04-15'`
    - description: Default selected date
- isRadio:
    - type: **Boolean**
    - default: `false`
    - description: Is it date radio selected?
- lang:
    - type: **String**
    - options: `'EN'` | `'CN'`
    - default: `'EN'`
    - description: The font language, for `CN` will use Chinese, for `EN` will use English
- position:
    - type: **String**
    - options: `'top'` | `'right'` | `'left'` | `'bottom'`
    - default: `'bottom'`
- interval:
    - type: **Array**
    - default: `[1970, 2030]`
    - eg:`[2000, 2020]`
    - description: Select abled range
- showFn:
    - type: **Function**
    - description: After show callback
- hideFn:
    - type: **Function**
    - description: After hide callback 
- onchange:
    - type: **Function**
    - description: callback which observe datePicker change

## Methods

- show: 
    - type: **Function**
- hide:
    - type: **Function**
    
## Usage

1. manually import `calendar.css` and `calendar.js`
2. create DatePicker contructor, for below:
    ```html
    <input type="text" id="datePicker">
    <span id="calendar"></span>
    ```
    

    ```js
   var dateComponent = new DatePicker({
           el: document.querySelector('#calendar'),
           onchange: function (curr) {
               dateInput.value = curr;
           }
   });

   var dateInput = document.querySelector('#datePicker');

   dateInput.onfocus = function () {
        dateComponent.show();
   };
    ```

