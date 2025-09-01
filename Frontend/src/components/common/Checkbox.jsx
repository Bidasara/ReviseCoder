const Checkbox = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded 
                 transition-all cursor-pointer
                 dark:border-gray-600 dark:bg-gray-700"
      />
      {label && (
        <label
          htmlFor={id}
          className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;