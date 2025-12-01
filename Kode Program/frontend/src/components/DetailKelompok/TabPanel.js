import React from "react";
import Select from "react-select";

const TabPanel = ({ tabs, selectedTab, onTabChange }) => {
  const options = tabs.map((tab) => ({ value: tab, label: tab }));

  const handleSelectChange = (selectedOption) => {
    onTabChange(selectedOption.value);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
      cursor: "pointer",
    }),
    menu: (provided) => ({
      ...provided,
      position: "absolute",
      zIndex: 9999, 
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <div className="bg-white relative z-50">
      <div className="block md:hidden p-2">
        <Select
          value={options.find((option) => option.value === selectedTab)}
          onChange={handleSelectChange}
          options={options}
          isSearchable={false}
          placeholder="Pilih tab..."
          className="react-select-container"
          classNamePrefix="react-select"
          styles={customStyles}
          menuPortalTarget={
            typeof document !== "undefined" ? document.body : null
          }
          menuPosition="fixed"
          menuShouldBlockScroll={true}
          menuPlacement="auto"
          menuShouldScrollIntoView={true}
        />
      </div>

      <div className="hidden md:flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`p-2 flex-1 ${
              selectedTab === tab
                ? "border-b-2 border-secondary"
                : "border-b-2 border-transparent"
            } focus:outline-none`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabPanel;
