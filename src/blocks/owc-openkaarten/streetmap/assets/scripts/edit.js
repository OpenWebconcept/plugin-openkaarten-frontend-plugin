import { BlockControls } from "@wordpress/block-editor";
import { SelectControl, __experimentalInputControl as InputControl, Notice } from "@wordpress/components";
import { useMemo, useLayoutEffect, useState, useEffect } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import apiFetch from '@wordpress/api-fetch';

export default function Edit({ attributes, setAttributes }) {
    const [isTypingUrl, setIsTypingUrl] = useState(false);
    const [datasets, setDatasets] = useState(null);
    const [selectedDatasets, setSelectedDatasets] = useState( attributes.selected_datasets );
    const isValidURL = useMemo(() => {
        try {
            new URL(attributes.rest_uri);
            return true;
        } catch (error) {
            return false;
        }
    }, [attributes.rest_uri]);

    useEffect(() => {
        if (isValidURL) {
            apiFetch({
                url: `${attributes.rest_uri}/wp-json/owc/openkaarten/v1/datasets`
            }).then(data => {
                setDatasets(data.datasets);
            }).catch(error => {
                console.error('Fetching datasets failed', error);
                setDatasets([]);
            });
        }
    }, [attributes.rest_uri, isValidURL]);

    const options = useMemo(() => {
        if (!datasets) {
            return [];
        }

        const options = datasets.map((item) => ({
            value: item.id.toString(),
            label: item.title ? item.title : "Untitled",
        }));

        options.unshift({
            value: "",
            label: __('Select the datalayers you want to display on the map', 'openkaarten-frontend-plugin'),
            disabled: true,
        });
        return options;
    }, [datasets]);

    useLayoutEffect(() => {
        const newLabels = options
            .filter((item) => selectedDatasets.includes(item.value))
            .map((item) => item.label);

        const datalayersElement = document.getElementById("datalayers");
        if (datalayersElement) {
            datalayersElement.innerHTML =
                newLabels.length > 0
                    ? newLabels.join("<br>")
                    : __('No datalayers selected', 'openkaarten-frontend-plugin');
        }
    }, [selectedDatasets, options]);

    const handleDatasetsChange = (newSelectedDatasets) => {
        const newDatasets = newSelectedDatasets.target.value
            ? selectedDatasets.includes(newSelectedDatasets.target.value)
                ? selectedDatasets.filter((dataset) => dataset !== newSelectedDatasets.target.value)
                : [...selectedDatasets, newSelectedDatasets.target.value]
            : [];

        setSelectedDatasets(newDatasets);
        setAttributes({ selected_datasets: newDatasets });
    };

    return (
        <>
            <BlockControls />
            <div className="owc-openkaarten-streetmap">
                <InputControl
                    label={__('URL to rest-endpoint or Domain URL', 'openkaarten-frontend-plugin')}
                    value={attributes.rest_uri}
                    onChange={(rest_uri) => {
                        setIsTypingUrl(true);
                        setAttributes({ rest_uri });
                    }}
                    onBlur={() => {
                        setIsTypingUrl(false);
                    }}
                />
                {!!attributes.rest_uri && !isTypingUrl && !isValidURL && (
                    <Notice status="error">
                        <p>
                            {__('Invalid URL', 'openkaarten-frontend-plugin')}
                        </p>
                    </Notice>
                )}
                <div className="owc-openkaarten-streetmap__row">
                    <SelectControl
                        multiple
                        label={__('Select datalayers:', 'openkaarten-frontend-plugin')}
                        value={attributes.selected_datasets}
                        onClick={handleDatasetsChange}
                        options={options.length ? options : [{
                            value: "",
                            label: __('No datalayers found', 'openkaarten-frontend-plugin'),
                            disabled: true,
                        }]}
                    />
                    <div className="components-message-box">
                        <label className="css-1imalal">{__('Selected datalayers', 'openkaarten-frontend-plugin')}</label>
                        <p id="datalayers">{__('No datalayers selected', 'openkaarten-frontend-plugin')}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
